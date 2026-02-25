from django.core.management.base import BaseCommand


RAMADAN_CATEGORIES = [
    {
        "name": "Pâtisseries feuilletées",
        "slug": "patisseries-feuilletees",
        "description": "Feuilletés au beurre, miel et fruits secs — parfaits pour l'iftar.",
    },
    {
        "name": "Desserts du Ramadan",
        "slug": "desserts-ramadan",
        "description": "Sélection spéciale Ramadan : qatayef, douceurs à partager et coffrets.",
    },
    {
        "name": "Dattes & noix",
        "slug": "dattes-noix",
        "description": "Dattes premium, fourrées et enrobées — énergie douce après le jeûne.",
    },
    {
        "name": "Jus frais Ramadan",
        "slug": "jus-frais",
        "description": "Boissons fraîches (citron & menthe, tamarin…) — parfaites à l'iftar.",
    },
    {
        "name": "Chocolat",
        "slug": "chocolat",
        "description": "Chocolats et douceurs au cacao — à offrir ou à déguster à l'iftar.",
    },
]

# Images: Pexels (format w=1200) et Unsplash pour un rendu très appétissant
RAMADAN_PRODUCTS = [
    # Pâtisseries feuilletées
    {
        "name": "Baklawa pistache — coffret 12 pièces",
        "slug": "baklawa-pistache-12",
        "category_slug": "patisseries-feuilletees",
        "description": "Baklawa feuilletée dorée, généreusement garnie de pistaches torréfiées, sirop au miel. À offrir pendant Ramadan.",
        "price": "18.90",
        "stock": 40,
        "image_url": "/catalog/baklawa_pistache_12.png",
    },
    {
        "name": "Baklawa mix — pistache & noix",
        "slug": "baklawa-mix-pistache-noix",
        "category_slug": "patisseries-feuilletees",
        "description": "Assortiment feuilleté (pistache & noix), sirop léger, finition pistache concassée. Coffret prestige.",
        "price": "21.90",
        "stock": 28,
        "image_url": "https://images.pexels.com/photos/30672435/pexels-photo-30672435.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        "name": "Baklawa noix — coffret 10 pièces",
        "slug": "baklawa-noix-10",
        "category_slug": "patisseries-feuilletees",
        "description": "Feuilletés aux noix et au miel, dorés au four. Texture croustillante et fondant en bouche.",
        "price": "16.50",
        "stock": 35,
        "image_url": "/catalog/baklawa_noix_10_pieces.png",
    },
    {
        "name": "Assortiment baklawa prestige — 3 variétés",
        "slug": "assortiment-baklawa-prestige",
        "category_slug": "patisseries-feuilletees",
        "description": "Pistache, noix et amandes — trois variétés dans un coffret cadeau. Parfait pour l'iftar en famille.",
        "price": "24.90",
        "stock": 22,
        "image_url": "/catalog/baklawa_3_sort.png",
    },
    {
        "name": "Baklawa amandes — coffret 8 pièces",
        "slug": "baklawa-amandes-8",
        "category_slug": "patisseries-feuilletees",
        "description": "Feuilletés aux amandes et miel, dorés et parfumés. Indémodable de la pâtisserie orientale.",
        "price": "17.90",
        "stock": 32,
        "image_url": "https://images.pexels.com/photos/7129411/pexels-photo-7129411.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        "name": "Samoussa sucré — pistache & miel",
        "slug": "samoussa-sucre-pistache",
        "category_slug": "patisseries-feuilletees",
        "description": "Feuilleté en triangle, garniture pistache et miel. Croquant et fondant, parfait à l'iftar.",
        "price": "14.50",
        "stock": 38,
        "image_url": "/catalog/samoussa_pistache_miel.png",
    },
    # Desserts du Ramadan
    {
        "name": "Sambali — gâteau de semoule au sirop",
        "slug": "sambali-semoule-sirop",
        "category_slug": "desserts-ramadan",
        "description": "Gâteau de semoule doré, nappé de sirop parfumé, pistaches et amandes. Indémodable de l'iftar.",
        "price": "12.90",
        "stock": 25,
        "image_url": "/catalog/sambali_semoule.png",
    },
    {
        "name": "Cheesecake Ramadan — croissant de lune",
        "slug": "cheesecake-ramadan-lune",
        "category_slug": "desserts-ramadan",
        "description": "Cheesecake onctueux en croissant de lune, glaçage caramel, fraises, myrtilles et biscuits Biscoff. Ramadan Kareem.",
        "price": "18.90",
        "stock": 15,
        "image_url": "/catalog/cheesecake_ramadan.png",
    },
    {
        "name": "Kunafa au fromage — dorée aux pistaches",
        "slug": "kunafa-fromage-pistaches",
        "category_slug": "desserts-ramadan",
        "description": "Kunafa croustillante, fromage fondant, sirop à la fleur d'oranger et pistaches. Servie tiède, le must du Ramadan.",
        "price": "14.50",
        "stock": 20,
        "image_url": "/catalog/kunafa_fromage.png",
    },
    {
        "name": "Tamina — gâteau aux amandes et rose",
        "slug": "tamina-amandes-rose",
        "category_slug": "desserts-ramadan",
        "description": "Gâteau traditionnel semoule et amandes, décoré de pétales de rose. Douceur et élégance pour l'iftar.",
        "price": "11.90",
        "stock": 22,
        "image_url": "/catalog/tamina.png",
    },
    {
        "name": "Tiramisu pistache — décor rose",
        "slug": "tiramisu-pistache-ramadan",
        "category_slug": "desserts-ramadan",
        "description": "Tiramisu revisité à la pistache, biscuits imbibés, crème onctueuse et pétales de rose. Un régal pour Ramadan.",
        "price": "16.90",
        "stock": 18,
        "image_url": "/catalog/tiramisu_pistache.png",
    },
    {
        "name": "Charlotte aux framboises — fraîcheur et amandes",
        "slug": "charlotte-framboises-amandes",
        "category_slug": "desserts-ramadan",
        "description": "Charlotte légère, biscuits à la cuillère, crème et framboises, amandes effilées et menthe. Parfait à l'iftar.",
        "price": "15.90",
        "stock": 16,
        "image_url": "/catalog/charlotte.png",
    },
    # Dattes & noix
    {
        "name": "Dattes Majhoul fourrées amandes",
        "slug": "dattes-majhoul-amandes",
        "category_slug": "dattes-noix",
        "description": "Dattes Majhoul moelleuses, fourrées aux amandes. À déguster à l'iftar ou en cadeau.",
        "price": "11.90",
        "stock": 60,
        "image_url": "/catalog/dattes_chocolat_coulis.png",
    },
    {
        "name": "Dattes Ajwa — coffret prestige",
        "slug": "dattes-ajwa",
        "category_slug": "dattes-noix",
        "description": "Dattes Ajwa (Medina), réputées pour leur douceur. Coffret cadeau pour Ramadan.",
        "price": "19.90",
        "stock": 35,
        "image_url": "/catalog/coffret_dattes_fourrees.png",
    },
    {
        "name": "Coffret dattes & amandes",
        "slug": "coffret-dattes-amandes",
        "category_slug": "dattes-noix",
        "description": "Dattes premium et amandes grillées. L'association parfaite pour rompre le jeûne.",
        "price": "14.90",
        "stock": 42,
        "image_url": "/catalog/dattes_miel_pistache.png",
    },
    {
        "name": "Dattes fourrées noix de pécan",
        "slug": "dattes-fourrees-pecan",
        "category_slug": "dattes-noix",
        "description": "Dattes moelleuses fourrées à la noix de pécan. Gourmandise à l'iftar.",
        "price": "13.90",
        "stock": 48,
        "image_url": "/catalog/dattes_pecan_pistache.png",
    },
    {
        "name": "Mélange fruits secs Ramadan",
        "slug": "melange-fruits-secs-ramadan",
        "category_slug": "dattes-noix",
        "description": "Dattes, amandes, noix et noisettes. Sachet à partager pour rompre le jeûne.",
        "price": "9.90",
        "stock": 55,
        "image_url": "/catalog/plateau_fruits_secs.png",
    },
    # Jus frais
    {
        "name": "Limonana — citron & menthe (frais)",
        "slug": "limonana-citron-menthe",
        "category_slug": "jus-frais",
        "description": "Citron pressé, menthe fraîche, glace pilée. Ultra rafraîchissant à l'iftar.",
        "price": "5.20",
        "stock": 120,
        "image_url": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=1200",
    },
    {
        "name": "Tamar Hindi — jus de tamarin",
        "slug": "tamar-hindi-tamarin",
        "category_slug": "jus-frais",
        "description": "Jus de tamarin équilibré (acidulé & doux), servi bien frais — classique Ramadan.",
        "price": "5.50",
        "stock": 120,
        "image_url": "/catalog/tamar_hindi.png",
    },
    {
        "name": "Jus d'orange frais — bouteille",
        "slug": "jus-orange-frais",
        "category_slug": "jus-frais",
        "description": "Orange pressée du jour, sans sucre ajouté. Vitamine C et fraîcheur garanties.",
        "price": "4.90",
        "stock": 100,
        "image_url": "/catalog/jus_orange.png",
    },
    {
        "name": "Jus de pastèque frais",
        "slug": "jus-pasteque-frais",
        "category_slug": "jus-frais",
        "description": "Pastèque pressée, désaltérante. Incontournable des tables d'iftar.",
        "price": "5.90",
        "stock": 80,
        "image_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200",
    },
    {
        "name": "Smoothie mangue & dattes",
        "slug": "smoothie-mangue-dattes",
        "category_slug": "jus-frais",
        "description": "Mangue, dattes et yaourt. Énergie et douceur après le jeûne.",
        "price": "6.50",
        "stock": 60,
        "image_url": "/catalog/smoothie_mangue.png",
    },
    # Chocolat
    {
        "name": "Chocolats orientaux — pistache & amande",
        "slug": "chocolats-orientaux-pistache",
        "category_slug": "chocolat",
        "description": "Chocolat noir et lait garni de pistaches et amandes. Coffret cadeau Ramadan.",
        "price": "22.90",
        "stock": 30,
        "image_url": "/catalog/chocolats_pistache_amande.png",
    },
    {
        "name": "Truffes au cacao — boîte 12",
        "slug": "truffes-cacao-12",
        "category_slug": "chocolat",
        "description": "Truffes fondantes enrobées de cacao. Parfaites avec un café après l'iftar.",
        "price": "14.90",
        "stock": 45,
        "image_url": "/catalog/coffret_lune_fraise.png",
    },
    {
        "name": "Chocolat aux dattes — barre",
        "slug": "chocolat-dattes-barre",
        "category_slug": "chocolat",
        "description": "Chocolat noir et pâte de dattes. L'association star du Ramadan.",
        "price": "6.90",
        "stock": 80,
        "image_url": "/catalog/plateau_bonbons.png",
    },
    {
        "name": "Pralines amandes & noisettes",
        "slug": "pralines-amandes-noisettes",
        "category_slug": "chocolat",
        "description": "Chocolat croquant aux amandes et noisettes caramélisées. Coffret prestige.",
        "price": "18.50",
        "stock": 25,
        "image_url": "/catalog/chocolat_aux_noix.png",
    },
    {
        "name": "Chocolat chaud épices — tablette",
        "slug": "chocolat-chaud-epices",
        "category_slug": "chocolat",
        "description": "Tablette à fondre, cannelle et cardamome. Pour un chocolat chaud d'iftar.",
        "price": "8.90",
        "stock": 55,
        "image_url": "/catalog/chocolat_coffret_bleu.png",
    },
    {
        "name": "Coffret chocolat Ramadan — 16 pièces",
        "slug": "coffret-chocolat-ramadan-16",
        "category_slug": "chocolat",
        "description": "Assortiment chocolats (dattes, pistache, noix, orange). Idéal en cadeau.",
        "price": "26.90",
        "stock": 20,
        "image_url": "/catalog/coffret_chocolat_assorti.png",
    },
]


class Command(BaseCommand):
    help = "Seed catalog with a Ramadan Middle East pâtisserie selection (idempotent)."

    def handle(self, *args, **options):
        from catalog.models import Category, Product

        self.stdout.write("Disabling existing catalog...")
        Category.objects.all().update(is_active=False)
        Product.objects.all().update(is_active=False)

        self.stdout.write("Upserting categories...")
        category_by_slug = {}
        for c in RAMADAN_CATEGORIES:
            obj, _ = Category.objects.update_or_create(
                slug=c["slug"],
                defaults={
                    "name": c["name"],
                    "description": c["description"],
                    "is_active": True,
                },
            )
            category_by_slug[c["slug"]] = obj

        self.stdout.write("Upserting products...")
        for p in RAMADAN_PRODUCTS:
            Product.objects.update_or_create(
                slug=p["slug"],
                defaults={
                    "category": category_by_slug[p["category_slug"]],
                    "name": p["name"],
                    "description": p["description"],
                    "price": p["price"],
                    "stock": p["stock"],
                    "is_active": True,
                    "image_url": p["image_url"],
                },
            )

        # Supprimer l’ancienne catégorie « Boissons & sirops » si elle existe encore en base
        Category.objects.filter(slug="boissons-sirops").delete()

        # Supprimer les catégories retirées du catalogue
        Category.objects.filter(
            slug__in=["kunafa-fromages", "gateaux-de-semoule", "maamoul-biscuits"]
        ).delete()

        # Supprimer les anciens produits Desserts du Ramadan remplacés par les nouvelles images
        Product.objects.filter(
            slug__in=[
                "qatayef-assortiment",
                "qatayef-noix-cannelle",
                "om-ali",
                "halwa-tahina",
                "coffret-desserts-ramadan-5",
            ]
        ).delete()

        self.stdout.write(self.style.SUCCESS("Ramadan catalog seeded successfully."))
