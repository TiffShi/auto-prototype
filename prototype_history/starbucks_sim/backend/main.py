import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import engine, Base

# Import all models so Alembic and Base.metadata are aware of them
import models  # noqa: F401

from routers import auth, menu, orders, admin, media

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (for development; use Alembic in production)
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")

    # Seed initial data if needed
    _seed_initial_data()

    yield
    logger.info("Shutting down...")


def _seed_initial_data():
    """Seed categories, modifiers, and a default admin user if not present."""
    from sqlalchemy.orm import Session
    from database import SessionLocal
    from models.category import Category
    from models.modifier import Modifier, ModifierType
    from models.user import User, UserRole
    from services.auth_service import hash_password

    db: Session = SessionLocal()
    try:
        # Seed categories
        if db.query(Category).count() == 0:
            categories = [
                Category(name="Hot Coffees", display_order=1),
                Category(name="Cold Brews", display_order=2),
                Category(name="Teas", display_order=3),
                Category(name="Refreshers", display_order=4),
                Category(name="Frappuccinos", display_order=5),
            ]
            db.add_all(categories)
            db.commit()
            logger.info("Seeded categories.")

        # Seed modifiers
        if db.query(Modifier).count() == 0:
            modifiers = [
                # Sizes
                Modifier(name="Tall", type=ModifierType.size, price_delta=0.00),
                Modifier(name="Grande", type=ModifierType.size, price_delta=0.50),
                Modifier(name="Venti", type=ModifierType.size, price_delta=1.00),
                # Milk types
                Modifier(name="Whole Milk", type=ModifierType.milk, price_delta=0.00),
                Modifier(name="Oat Milk", type=ModifierType.milk, price_delta=0.70),
                Modifier(name="Almond Milk", type=ModifierType.milk, price_delta=0.70),
                Modifier(name="Skim Milk", type=ModifierType.milk, price_delta=0.00),
                Modifier(name="No Milk", type=ModifierType.milk, price_delta=0.00),
                # Extras
                Modifier(name="Extra Shot", type=ModifierType.extra, price_delta=0.80),
                Modifier(name="Vanilla Syrup", type=ModifierType.extra, price_delta=0.50),
                Modifier(name="Caramel Syrup", type=ModifierType.extra, price_delta=0.50),
                Modifier(name="Hazelnut Syrup", type=ModifierType.extra, price_delta=0.50),
                Modifier(name="Whipped Cream", type=ModifierType.extra, price_delta=0.00),
                Modifier(name="Extra Foam", type=ModifierType.extra, price_delta=0.00),
                Modifier(name="Light Ice", type=ModifierType.extra, price_delta=0.00),
                Modifier(name="No Ice", type=ModifierType.extra, price_delta=0.00),
            ]
            db.add_all(modifiers)
            db.commit()
            logger.info("Seeded modifiers.")

        # Seed admin user
        admin_email = "admin@starbucks.local"
        if not db.query(User).filter(User.email == admin_email).first():
            admin_user = User(
                email=admin_email,
                name="Admin",
                hashed_password=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"Seeded admin user: {admin_email} / admin123")

        # Seed sample drinks
        from models.drink import Drink, DrinkModifier
        from models.modifier import Modifier as Mod
        if db.query(Drink).count() == 0:
            cat_map = {c.name: c.id for c in db.query(Category).all()}
            all_modifier_ids = [m.id for m in db.query(Mod).all()]

            sample_drinks = [
                Drink(
                    category_id=cat_map["Hot Coffees"],
                    name="Caffè Americano",
                    description="Espresso shots topped with hot water to produce a light layer of crema.",
                    base_price=3.45,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Hot Coffees"],
                    name="Caffè Latte",
                    description="Rich, full-bodied espresso in steamed milk with a light layer of foam.",
                    base_price=4.25,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Hot Coffees"],
                    name="Cappuccino",
                    description="Dark, rich espresso lies in wait under a smoothed and stretched layer of deep foam.",
                    base_price=4.25,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Cold Brews"],
                    name="Cold Brew Coffee",
                    description="Handcrafted in small batches, slow-steeped in cool water for 20 hours.",
                    base_price=4.45,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Cold Brews"],
                    name="Vanilla Sweet Cream Cold Brew",
                    description="Our slow-steeped custom blend topped with a delicate float of house-made vanilla sweet cream.",
                    base_price=5.25,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Teas"],
                    name="Chai Tea Latte",
                    description="Black tea infused with cinnamon, clove and other warming spices.",
                    base_price=4.25,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Teas"],
                    name="Matcha Tea Latte",
                    description="Smooth and creamy matcha sweetened just right and served with steamed milk.",
                    base_price=4.75,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Refreshers"],
                    name="Strawberry Açaí Refresher",
                    description="Sweet strawberry flavors accented by passion fruit and açaí notes.",
                    base_price=4.45,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Refreshers"],
                    name="Mango Dragonfruit Refresher",
                    description="Tropical flavors of mango and dragonfruit with a splash of coconut milk.",
                    base_price=4.45,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Frappuccinos"],
                    name="Caramel Frappuccino",
                    description="Caramel syrup meets coffee, milk and ice for a rendezvous in the blender.",
                    base_price=5.25,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Frappuccinos"],
                    name="Mocha Frappuccino",
                    description="Mocha sauce and Frappuccino® chips blended with milk and ice.",
                    base_price=5.25,
                    is_available=True,
                ),
                Drink(
                    category_id=cat_map["Frappuccinos"],
                    name="Java Chip Frappuccino",
                    description="Mocha sauce and Frappuccino® chips blended with milk and ice, topped with whipped cream.",
                    base_price=5.45,
                    is_available=True,
                ),
            ]
            db.add_all(sample_drinks)
            db.flush()

            # Attach all modifiers to each drink
            for drink in sample_drinks:
                for mod_id in all_modifier_ids:
                    dm = DrinkModifier(drink_id=drink.id, modifier_id=mod_id)
                    db.add(dm)

            db.commit()
            logger.info("Seeded sample drinks.")

    except Exception as e:
        logger.error(f"Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


app = FastAPI(
    title="Starbucks Ordering API",
    description="Backend API for the Starbucks-like drink ordering application",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(media.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "starbucks-api"}