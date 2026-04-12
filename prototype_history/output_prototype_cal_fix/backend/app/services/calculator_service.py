import ast
import operator
import re
from typing import Union

# ---------------------------------------------------------------------------
# Custom exception
# ---------------------------------------------------------------------------

class CalculatorError(Exception):
    """Raised when an expression cannot be evaluated safely."""


# ---------------------------------------------------------------------------
# Whitelist of allowed AST node types and binary operators
# ---------------------------------------------------------------------------

_ALLOWED_OPERATORS: dict[type, callable] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

_ALLOWED_NODE_TYPES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Constant,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.USub,
    ast.UAdd,
)

# ---------------------------------------------------------------------------
# Input sanitisation
# ---------------------------------------------------------------------------

# Only digits, whitespace, decimal points, and the four operators + parentheses
_SAFE_PATTERN = re.compile(r"^[\d\s\+\-\*\/\.\(\)]+$")


def _sanitise(expression: str) -> str:
    """
    Strip leading/trailing whitespace and verify the expression contains only
    characters that are valid in a simple arithmetic expression.

    Raises CalculatorError for any disallowed characters.
    """
    expr = expression.strip()

    if not expr:
        raise CalculatorError("Expression must not be empty.")

    if not _SAFE_PATTERN.match(expr):
        raise CalculatorError(
            "Expression contains invalid characters. "
            "Only numbers, +, -, *, /, ., (, ) are allowed."
        )

    return expr


# ---------------------------------------------------------------------------
# AST-based evaluator
# ---------------------------------------------------------------------------

def _eval_node(node: ast.AST) -> Union[int, float]:
    """
    Recursively evaluate an AST node.

    Only whitelisted node types are permitted; anything else raises
    CalculatorError to prevent code injection.
    """
    if not isinstance(node, _ALLOWED_NODE_TYPES):
        raise CalculatorError(
            f"Unsupported operation or expression type: {type(node).__name__}"
        )

    if isinstance(node, ast.Expression):
        return _eval_node(node.body)

    if isinstance(node, ast.Constant):
        if not isinstance(node.value, (int, float)):
            raise CalculatorError(
                f"Unsupported literal type: {type(node.value).__name__}"
            )
        return node.value

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in _ALLOWED_OPERATORS:
            raise CalculatorError(f"Unsupported binary operator: {op_type.__name__}")

        left = _eval_node(node.left)
        right = _eval_node(node.right)

        # Guard against division by zero before calling the operator
        if op_type is ast.Div:
            if right == 0:
                raise CalculatorError("Division by zero is not allowed.")

        return _ALLOWED_OPERATORS[op_type](left, right)

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in _ALLOWED_OPERATORS:
            raise CalculatorError(f"Unsupported unary operator: {op_type.__name__}")

        operand = _eval_node(node.operand)
        return _ALLOWED_OPERATORS[op_type](operand)

    # Should never reach here given the isinstance guard above, but be explicit.
    raise CalculatorError("Unexpected node type encountered during evaluation.")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_expression(expression: str) -> Union[int, float]:
    """
    Safely evaluate an arithmetic expression string.

    Steps:
    1. Sanitise the raw string (whitelist check).
    2. Parse it into an AST using :func:`ast.parse`.
    3. Walk the AST, allowing only numeric literals and the four basic
       arithmetic operators.
    4. Return the numeric result.

    Args:
        expression: A string such as ``"8 * (3 + 2)"`` or ``"10 / 2.5"``.

    Returns:
        The numeric result as an :class:`int` or :class:`float`.

    Raises:
        CalculatorError: For invalid input, unsafe constructs, or math errors.
    """
    sanitised = _sanitise(expression)

    try:
        tree = ast.parse(sanitised, mode="eval")
    except SyntaxError as exc:
        raise CalculatorError(
            f"Malformed expression: {exc.msg}"
        ) from exc

    result = _eval_node(tree)

    # Normalise -0.0 → 0
    if result == 0:
        return 0

    # Return an int when the result is a whole number (e.g. 40.0 → 40)
    if isinstance(result, float) and result.is_integer():
        return int(result)

    return result