from django.db import migrations


def create_demo_data(apps, schema_editor):
    Category = apps.get_model("catalog", "Category")
    Product = apps.get_model("catalog", "Product")

    if Category.objects.exists() or Product.objects.exists():
        return

    electronics = Category.objects.create(
        name="Électronique",
        slug="electronique",
        description="Smartphones, ordinateurs portables, accessoires et plus.",
        is_active=True,
    )
    clothing = Category.objects.create(
        name="Vêtements",
        slug="vetements",
        description="Mode pour hommes, femmes et enfants.",
        is_active=True,
    )
    home = Category.objects.create(
        name="Maison & Cuisine",
        slug="maison-cuisine",
        description="Produits pour la maison, la cuisine et la décoration.",
        is_active=True,
    )

    Product.objects.bulk_create(
        [
            Product(
                category=electronics,
                name="Smartphone Pro 128 Go",
                slug="smartphone-pro-128-go",
                description="Smartphone haut de gamme avec écran OLED et triple caméra.",
                price=899.99,
                stock=25,
                is_active=True,
            ),
            Product(
                category=electronics,
                name="Ordinateur Portable 15\"",
                slug="ordinateur-portable-15",
                description="PC portable performant pour le travail et le divertissement.",
                price=1199.00,
                stock=10,
                is_active=True,
            ),
            Product(
                category=clothing,
                name="T-shirt Coton Unisexe",
                slug="tshirt-coton-unisexe",
                description="T-shirt 100% coton, coupe confortable, plusieurs couleurs.",
                price=19.99,
                stock=100,
                is_active=True,
            ),
            Product(
                category=home,
                name="Batterie de Cuisine 10 Pièces",
                slug="batterie-cuisine-10-pieces",
                description="Ensemble complet de casseroles et poêles antiadhésives.",
                price=149.90,
                stock=15,
                is_active=True,
            ),
        ]
    )


def delete_demo_data(apps, schema_editor):
    Category = apps.get_model("catalog", "Category")
    Product = apps.get_model("catalog", "Product")

    slugs = [
        "electronique",
        "vetements",
        "maison-cuisine",
        "smartphone-pro-128-go",
        "ordinateur-portable-15",
        "tshirt-coton-unisexe",
        "batterie-cuisine-10-pieces",
    ]

    Product.objects.filter(slug__in=slugs).delete()
    Category.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_demo_data, delete_demo_data),
    ]

