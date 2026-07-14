import { Book } from "@/types";

export const mockBooks: Book[] = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0KmzvUkwBrXJkWQZkwUnWNG251g4dX1yCK2rRcuj2img9FHclYO1qPm8VVFRNZ9W8p67UCgjOdqdJfilFkZfhCJzAnoY9zTdbjK7Zx4uzieiUJaeFcJZqyqllq-Bs6RSF0xIerhN9ilWj-akJwb_3hgDFbg6bO8Rh8ySOEZ-Uj22h-WYZTox6JTM2WIqo1aUGT6vZ5sNuEJ5EX-fuN-S7bKy2ejo1IGfz2CxJFRequKCxxb3myJczvA",
    rating: 4.8,
    pages: 320,
    year: 2018,
    category: "Self Help",
    language: "English",
    borrowedCount: 18,
    available: true,
    synopsis: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results."
  },
  {
    id: 2,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU3TCGQjpZW7S5hf7BA3XmuufuuUsvIvNnp4gPACDW7jEHA6JK9p-g72m3TgXG_4wWYvQ92WYEbyNVvTMo_1Uirt0fnQOceEyL4SgRfV9hknnjat5xgLwNTXIYGSzwYceFHh11ntfQ_vrPilHT8_99f26yihnBaQjIAFhI6Or1tW3gM9tE2fj8jS5teKCNqasJ7o0xNHCJy9aS_9jvYcWLRv3fSsnGRqz0fqADV3OO2DRXQPllB5ofFw",
    rating: 4.7,
    pages: 310,
    year: 1937,
    category: "Fantasy",
    language: "English",
    borrowedCount: 24,
    available: false,
    synopsis: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort."
  },
  {
    id: 3,
    title: "Deep Work",
    author: "Cal Newport",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS7RDo02ijq2H_DmmTXc0_7uV1PSY6vjUqPxYJEB4qoptoysKc1WHe1iV9oo6aD6AX6L0hhlvMIPIhYx1WM1mL7LWFD8Gyvh3Sz_OVJktxfFywUb31ebjkfSoXwAASjnBBfbVbQCwglBTWCnEfUwJDp0bTKvEykOenikPa-CNGNrxPKitBZqga724u86tyKKxee609QUUdSmGp_lAX2AH1JD2WCvVsJXwLDMz8xwunb0plZfNfc9PHMg",
    rating: 4.6,
    pages: 296,
    year: 2016,
    category: "Business",
    language: "English",
    borrowedCount: 12,
    available: true,
    synopsis: "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship."
  }
];
