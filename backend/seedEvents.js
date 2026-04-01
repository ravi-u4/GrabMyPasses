const mongoose = require("mongoose");
const Event = require("./models/Event");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/studentAuth");
  console.log("DB Connected");

  const longDescription = `
About This Event
Connect with fellow founders and learn from successful entrepreneurs over breakfast!

Featured speakers:
- Series B founder sharing fundraising journey
- Angel investor revealing what they look for
- Growth hacker with proven scaling strategies
- Failed startup founder sharing lessons learned

Agenda:
- 8:00 AM - Networking breakfast
- 9:00 AM - Panel discussion
- 10:00 AM - Q&A session
- 10:30 AM - One-on-one speed networking

This intimate gathering is perfect for early-stage founders, aspiring entrepreneurs, and anyone interested in the startup ecosystem.

Continental breakfast and unlimited coffee included!
  `;

  const sampleEvents = [
    {
      title: "Tech Expo 2025",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Auditorium",
      date: "2025-03-12",
      time: "10:00 AM",
      description: longDescription,
      capacity: 500
    },
    {
      title: "Cultural Night",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Central Lawn",
      date: "2025-04-01",
      time: "6:00 PM",
      description: longDescription,
      capacity: 800
    },
    {
      title: "Sports Fiesta",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Main Ground",
      date: "2025-03-20",
      time: "9:00 AM",
      description: longDescription,
      capacity: 700
    },
    {
      title: "Hackathon 36H",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Computer Lab Block",
      date: "2025-05-10",
      time: "8:00 AM",
      description: longDescription,
      capacity: 250
    },
    {
      title: "AI & Robotics Workshop",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Seminar Hall",
      date: "2025-03-30",
      time: "11:00 AM",
      description: longDescription,
      capacity: 300
    },
    {
      title: "Movie Marathon",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Open Air Theater",
      date: "2025-04-14",
      time: "5:00 PM",
      description: longDescription,
      capacity: 900
    },
    {
      title: "Food Festival",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Campus Food Street",
      date: "2025-04-20",
      time: "1:00 PM",
      description: longDescription,
      capacity: 1000
    },
    {
      title: "Pop Band Concert",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Central Stage",
      date: "2025-04-25",
      time: "7:00 PM",
      description: longDescription,
      capacity: 2000
    },
    {
      title: "Photography Contest",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Art Block",
      date: "2025-05-05",
      time: "10:00 AM",
      description: longDescription,
      capacity: 400
    },
    {
      title: "Gaming Tournament",
      banner: "https://unsplash.com/photos/blue-and-silver-tubes-intertwined-on-black-background-JaIKK9Y3gLI",
      venue: "Innovation Hub",
      date: "2025-05-18",
      time: "9:00 AM",
      description: longDescription,
      capacity: 350
    }
  ];

  await Event.insertMany(sampleEvents);
  console.log("🎉 10 Sample Events Added Successfully!");

  mongoose.connection.close();
  console.log("DB Closed");
}

seed();
