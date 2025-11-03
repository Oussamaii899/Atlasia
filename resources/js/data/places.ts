import type { Place } from "@/types/place"

export const places: Place[] = [
  {
    id: "1",
    name: "Grand Luxury Hotel",
    category: "Hotel",
    description:
      "Experience luxury like never before at our 5-star hotel with stunning views, exceptional service, and world-class amenities including a spa, fitness center, and multiple dining options.",
    location: "Downtown, New York",
    image: "/images/hotel1.jpg",
    rating: 4.8,
    reviewCount: 324,
    features: [
      "Free WiFi",
      "Swimming Pool",
      "Spa & Wellness Center",
      "24/7 Room Service",
      "Fitness Center",
      "Multiple Restaurants",
    ],
    comments: [
      {
        id: "c1",
        user: {
          id: "u1",
          name: "John Smith",
          avatar: "/avatars/john.jpg",
        },
        content:
          "Absolutely amazing stay! The staff was incredibly attentive and the room had breathtaking views of the city. Will definitely be coming back soon.",
        date: "2023-11-15T14:30:00Z",
        likes: 24,
        dislikes: 1,
        replies: [
          {
            id: "r1",
            user: {
              id: "u2",
              name: "Hotel Staff",
              avatar: "/avatars/staff.jpg",
            },
            content:
              "Thank you for your wonderful review, John! We're delighted to hear you enjoyed your stay and we look forward to welcoming you back soon.",
            date: "2023-11-15T16:45:00Z",
            likes: 5,
            dislikes: 0,
            replies: [],
          },
        ],
      },
      {
        id: "c2",
        user: {
          id: "u3",
          name: "Sarah Johnson",
          avatar: "/avatars/sarah.jpg",
        },
        content:
          "The hotel is beautiful but I was disappointed with the breakfast options. For the price, I expected more variety.",
        date: "2023-11-10T09:15:00Z",
        likes: 8,
        dislikes: 3,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    name: "Seaside Restaurant",
    category: "Restaurant",
    description:
      "Enjoy fresh seafood and breathtaking ocean views at our beachfront restaurant. Our menu features locally sourced ingredients and our signature cocktails are not to be missed.",
    location: "Beach Boulevard, Miami",
    image: "/images/restaurant1.jpg",
    rating: 4.6,
    reviewCount: 512,
    features: ["Ocean View", "Outdoor Seating", "Live Music", "Vegan Options", "Full Bar", "Private Dining"],
    comments: [
      {
        id: "c3",
        user: {
          id: "u4",
          name: "Michael Brown",
          avatar: "/avatars/michael.jpg",
        },
        content:
          "The seafood platter was incredible! So fresh and flavorful. The sunset view from our table made the experience even more special.",
        date: "2023-11-18T19:20:00Z",
        likes: 42,
        dislikes: 0,
        replies: [],
      },
    ],
  },
  {
    id: "3",
    name: "City Stadium",
    category: "Stadium",
    description:
      "Home to the city's beloved sports teams, our stadium offers state-of-the-art facilities, excellent sightlines from every seat, and a vibrant atmosphere on game days.",
    location: "Sports District, Chicago",
    image: "/images/stadium1.jpg",
    rating: 4.5,
    reviewCount: 1024,
    features: [
      "50,000 Capacity",
      "Food Concessions",
      "Team Store",
      "VIP Boxes",
      "Public Transportation Access",
      "Guided Tours",
    ],
    comments: [
      {
        id: "c4",
        user: {
          id: "u5",
          name: "David Wilson",
          avatar: "/avatars/david.jpg",
        },
        content:
          "Great atmosphere during the game! The seats were comfortable and the view was perfect. Food options could be better though.",
        date: "2023-11-05T15:10:00Z",
        likes: 31,
        dislikes: 5,
        replies: [],
      },
    ],
  },
  {
    id: "4",
    name: "Mountain View Resort",
    category: "Hotel",
    description:
      "Nestled in the mountains, our resort offers a peaceful retreat with stunning natural surroundings, outdoor activities, and cozy accommodations with fireplaces.",
    location: "Alpine Valley, Colorado",
    image: "/images/hotel2.jpg",
    rating: 4.7,
    reviewCount: 289,
    features: [
      "Mountain Views",
      "Hiking Trails",
      "Ski-in/Ski-out",
      "Hot Tubs",
      "Fireplace in Rooms",
      "Organic Restaurant",
    ],
    comments: [
      {
        id: "c5",
        user: {
          id: "u6",
          name: "Emily Davis",
          avatar: "/avatars/emily.jpg",
        },
        content:
          "The perfect mountain getaway! We loved the hiking trails and the cozy fireplace in our room. The staff was very knowledgeable about local activities.",
        date: "2023-11-12T11:25:00Z",
        likes: 19,
        dislikes: 0,
        replies: [],
      },
    ],
  },
  {
    id: "5",
    name: "Fusion Bistro",
    category: "Restaurant",
    description:
      "Our innovative chef combines flavors from around the world to create unique culinary experiences. The intimate setting and attentive service make for a memorable dining experience.",
    location: "Arts District, San Francisco",
    image: "/images/restaurant2.jpg",
    rating: 4.9,
    reviewCount: 378,
    features: [
      "Tasting Menu",
      "Wine Pairings",
      "Open Kitchen",
      "Chef's Table",
      "Seasonal Menu",
      "Dietary Accommodations",
    ],
    comments: [
      {
        id: "c6",
        user: {
          id: "u7",
          name: "Robert Chen",
          avatar: "/avatars/robert.jpg",
        },
        content:
          "One of the best dining experiences I've ever had! The flavor combinations were unexpected but worked perfectly together. The chef even came out to explain some of the dishes.",
        date: "2023-11-20T20:15:00Z",
        likes: 56,
        dislikes: 1,
        replies: [],
      },
    ],
  },
  {
    id: "6",
    name: "Historic Arena",
    category: "Stadium",
    description:
      "This iconic venue has hosted legendary performances and sporting events for decades. Recently renovated with modern amenities while preserving its historic charm.",
    location: "Downtown, Boston",
    image: "/images/stadium2.jpg",
    rating: 4.4,
    reviewCount: 892,
    features: [
      "Historic Architecture",
      "Modern Sound System",
      "Premium Seating",
      "Multiple Bars",
      "Museum Section",
      "Accessible Facilities",
    ],
    comments: [
      {
        id: "c7",
        user: {
          id: "u8",
          name: "Jennifer Lopez",
          avatar: "/avatars/jennifer.jpg",
        },
        content:
          "Saw my favorite band here last weekend. The sound was amazing and even though it's a large venue, it still felt intimate. Love the history of this place!",
        date: "2023-11-08T22:40:00Z",
        likes: 27,
        dislikes: 2,
        replies: [],
      },
    ],
  },
]
