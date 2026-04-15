import ast
import operator
from typing import Union

# Whitelist of allowed AST node types
ALLOWED_NODE_TYPES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Constant,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.FloorDiv,
    ast.Mod,
    ast.Pow,
    ast.USub,
    ast.UAdd,
)

# Mapping of AST operator types to actual Python operators
BINARY_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

UNARY_OPERATORS = {
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

# Limits to prevent abuse
MAX_EXPRESSION_LENGTH = 200
MAX_POWER_EXPONENT = 1000


class EvaluationError(Exception):
    """Raised when an expression cannot be safely evaluated."""
    pass


def _validate_expression_string(expression: str) -> None:
    """Perform basic string-level validation before AST parsing."""
    if not expression or not expression.strip():
        raise EvaluationError("Expression cannot be empty")

    if len(expression) > MAX_EXPRESSION_LENGTH:
        raise EvaluationError(
            f"Expression too long (max {MAX_EXPRESSION_LENGTH} characters)"
        )

    # Check for obviously disallowed characters
    allowed_chars = set("0123456789+-*/.() \t%^")
    disallowed = set(expression) - allowed_chars
    if disallowed:
        raise EvaluationError(
            f"Expression contains disallowed characters: {', '.join(repr(c) for c in disallowed)}"
        )


def _eval_node(node: ast.AST) -> Union[int, float]:
    """
    Recursively evaluate an AST node.
    Only whitelisted node types are permitted.
    """
    if not isinstance(node, ALLOWED_NODE_TYPES):
        raise EvaluationError(
            f"Unsupported operation or expression type: {type(node).__name__}"
        )

    if isinstance(node, ast.Expression):
        return _eval_node(node.body)

    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise EvaluationError(f"Unsupported constant type: {type(node.value).__name__}")

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in BINARY_OPERATORS:
            raise EvaluationError(f"Unsupported binary operator: {op_type.__name__}")

        left = _eval_node(node.left)
        right = _eval_node(node.right)

        # Guard against division by zero
        if op_type in (ast.Div, ast.FloorDiv, ast.Mod) and right == 0:
            raise EvaluationError("Division by zero")

        # Guard against excessively large exponents
        if op_type == ast.Pow:
            if abs(right) > MAX_POWER_EXPONENT:
                raise EvaluationError(
                    f"Exponent too large (max {MAX_POWER_EXPONENT})"
                )

        result = BINARY_OPERATORS[op_type](left, right)

        # Guard against overflow / infinity
        if isinstance(result, float) and (result != result or abs(result) == float("inf")):
            raise EvaluationError("Result is undefined (overflow or NaN)")

        return result

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in UNARY_OPERATORS:
            raise EvaluationError(f"Unsupported unary operator: {op_type.__name__}")
        operand = _eval_node(node.operand)
        return UNARY_OPERATORS[op_type](operand)

    raise EvaluationError(f"Unexpected node type: {type(node).__name__}")


def evaluate_expression(expression: str) -> Union[int, float]:
    """
    Safely evaluate a mathematical expression string.

    Uses Python's `ast` module to parse the expression into an AST,
    then walks the tree — only allowing whitelisted numeric operations.
    `eval()` is never called directly.

    Args:
        expression: A string containing a mathematical expression.

    Returns:
        The numeric result as an int or float.

    Raises:
        EvaluationError: If the expression is invalid, unsafe, or causes
                         a mathematical error (e.g. division by zero).
    """
    _validate_expression_string(expression)

    # Normalize the expression: replace ^ with ** for power operator
    normalized = expression.strip().replace("^", "**")

    try:
        tree = ast.parse(normalized, mode="eval")
    except SyntaxError as exc:
        raise EvaluationError(f"Invalid expression syntax: {exc.msg}") from exc

    result = _eval_node(tree)

    # Return int if the result is a whole number float (e.g. 4.0 → 4)
    if isinstance(result, float) and result.is_integer():
        return int(result)

    return result