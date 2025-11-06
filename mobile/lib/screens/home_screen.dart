import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🍔 CrossFood'),
        actions: [
          IconButton(
            icon: const Icon(Icons.login),
            onPressed: () {
              context.go('/login'); // Navega a login
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Bienvenido a CrossFood',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          const Text(
            'Explora nuestro menú y disfruta la mejor comida de la ciudad 🍕',
            style: TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 20),

          // Tarjetas de comida de ejemplo
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 3 / 4,
            children: [
              _FoodItem(
                name: 'Pizza Margarita',
                price: 25000,
                imageUrl:
                    'https://images.unsplash.com/photo-1601924582971-d0528a2f7d83',
              ),
              _FoodItem(
                name: 'Hamburguesa Clásica',
                price: 18000,
                imageUrl:
                    'https://images.unsplash.com/photo-1550547660-d9450f859349',
              ),
              _FoodItem(
                name: 'Papas Fritas',
                price: 8000,
                imageUrl:
                    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90',
              ),
              _FoodItem(
                name: 'Bebida Refrescante',
                price: 5000,
                imageUrl:
                    'https://images.unsplash.com/photo-1600195077073-7c815f540a3a',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FoodItem extends StatelessWidget {
  final String name;
  final int price;
  final String imageUrl;

  const _FoodItem({
    required this.name,
    required this.price,
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Image.network(imageUrl, height: 120, fit: BoxFit.cover),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '\$${price.toString()}',
                  style: const TextStyle(color: Colors.orange, fontSize: 14),
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () {
                    // Si no está loggeado, GoRouter lo mandará al login (según tu redirect en main)
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Agregado al carrito'),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.deepOrange,
                    minimumSize: const Size(double.infinity, 35),
                  ),
                  child: const Text('Añadir'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
