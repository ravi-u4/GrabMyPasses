const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Event = require("./models/Event");
const Organizer = require("./models/Organizer");
const connectDB = require("./db");

// Load env vars
dotenv.config();

// ----------------------------------------------------------------------
// SEED DATA CONFIGURATION
// ----------------------------------------------------------------------
const COLLEGE_NAME = "Smt. CHM College - Dept. of IT";

// ======================================================
// EVENTS
// ======================================================
const events = [

  // ---------------- DAY 1 ----------------
  {
    title: "UI SHOWDOWN",
    date: "2026-01-20",
    startTime: "11:00 AM",
    venue: "IT Lab Room No. 120",
    category: "Technical",
    isPaid: true,
    price: 30,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/ui-showdown.png",
    maxCapacity: 60,
    description: `🎨 Frontend battle to recreate a given UI in limited time.

    🧠 Judging: Design, responsiveness & code quality`
  },
  {
    title: "CODE REWIND",
    date: "2026-01-20",
    startTime: "11:00 AM",
    venue: "IT Lab Room No. 107",
    category: "Technical",
    isPaid: true,
    price: 30,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/code-rewind.png",
    maxCapacity: 60,
    description: `⏪ We give output, you write code using logic.`
  },

  // ---------------- DAY 2 ----------------
  {
    title: "DOODLE 2 DECODE",
    date: "2026-01-21",
    startTime: "09:00 AM",
    venue: "THM Hall",
    category: "Non-Technical",
    isPaid: false,
    price: 0,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/doodle.png",
    maxCapacity: 50,
    description: `✏️ Guess the drawing & win.`
  },
  {
    title: "VERBAL LOOP",
    date: "2026-01-21",
    startTime: "10:15 AM",
    venue: "THM Hall",
    category: "Non-Technical",
    isPaid: false,
    price: 0,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/verbal-loop.png",
    maxCapacity: 50,
    description: `🔄 Tongue twister challenge`
  },

  // ----------- NEW EVENTS -----------
  {
    title: "HACK THE FUTURE",
    date: "2026-01-21",
    startTime: "11:30 AM",
    venue: "IT Lab 120",
    category: "Technical",
    isPaid: true,
    price: 50,
    college: COLLEGE_NAME,
    bannerUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
    maxCapacity: 80,
    description: `💻 Mini Hackathon`
  },
  {
    title: "REEL RUSH",
    date: "2026-01-21",
    startTime: "01:00 PM",
    venue: "Campus",
    category: "Non-Technical",
    isPaid: false,
    price: 0,
    college: COLLEGE_NAME,
    bannerUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    maxCapacity: 60,
    description: `🎬 Instagram Reel Competition`
  },
  {
  title: "CODE WARS",
  date: "2026-01-21",
  startTime: "10:00 AM",
  venue: "Main Seminar Hall",
  category: "Technical",
  isPaid: true,
  price: 50,
  college: "IIT Bombay",
  bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  maxCapacity: 80,
  description: `⚔️ Battle of the Coders!
  Dive into an intense coding showdown where logic meets speed and accuracy 💻🔥

  📜 Event Format:
  • Solo Participation
  • 3 Coding Rounds (Easy → Hard)
  • Languages: C, C++, Java, Python
  • Live leaderboard 📊

  🏆 Top Coders Win Cash Prizes & Goodies 🎁
  📜 Certificates for all participants

  🚀 Show your coding power and become the ultimate champion!`
},
{
  title: "ROBOT RACE",
  date: "2026-01-21",
  startTime: "1:00 PM",
  venue: "Mechanical Lab Arena",
  category: "Technical",
  isPaid: true,
  price: 100,
  college: "VIT Vellore",
  bannerUrl: "https://images.unsplash.com/photo-1581092918367-7d8f9c5b8c0b",
  maxCapacity: 40,
  description: `🤖 Speed. Control. Engineering!
  Bring your custom-built robot and compete on a thrilling obstacle track 🏁

  ⚙️ Rules:
  • Wired/Wireless robots allowed
  • Max size: 30x30 cm
  • Time-based scoring ⏱️

  🏆 Trophy + Cash Prize
  📜 Participation Certificates

  💥 Let your robot rule the track!`
},
{
  title: "STARTUP PITCH",
  date: "2026-01-22",
  startTime: "11:30 AM",
  venue: "Innovation Hall",
  category: "Non-Technical",
  isPaid: false,
  price: 0,
  college: "NMIMS Mumbai",
  bannerUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
  maxCapacity: 60,
  description: `🚀 Got a billion-dollar idea?
  Pitch your startup concept to a panel of industry experts 💡

  📋 Event Flow:
  • 5 minutes pitch
  • 3 minutes Q&A
  • Evaluation on innovation & feasibility

  🏆 Best Idea gets mentorship & prizes 🎉
  📜 Certificates for all presenters

  🌟 Turn your idea into reality!`
},
{
  title: "CYBER HUNT",
  date: "2026-01-22",
  startTime: "2:00 PM",
  venue: "Computer Lab 3",
  category: "Technical",
  isPaid: true,
  price: 40,
  college: "MIT Pune",
  bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  maxCapacity: 50,
  description: `🕵️ Hack. Decode. Win!
  A thrilling cybersecurity treasure hunt full of hidden clues & puzzles 🔐

  🧩 Format:
  • Teams of 2
  • Solve encryption & hacking challenges
  • Time-based leaderboard

  🏆 Cash prizes + certificates
  ⚡ Test your cyber skills now!`
},
{
  title: "DESIGNATHON",
  date: "2026-01-23",
  startTime: "10:00 AM",
  venue: "Design Studio",
  category: "Technical",
  isPaid: false,
  price: 0,
  college: "NIFT Delhi",
  bannerUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  maxCapacity: 70,
  description: `🎨 Unleash Your Creativity!
  Create stunning UI/UX designs for real-world problems 🖌️✨

  🖥️ Tools: Figma, Adobe XD
  ⏳ Duration: 3 Hours
  👨‍🎨 Solo or Duo

  🏆 Prizes for best designs
  📜 Certificates for all

  💡 Let your imagination shine!`
},
{
  title: "TREASURE HUNT",
  date: "2026-01-23",
  startTime: "3:00 PM",
  venue: "College Campus",
  category: "Non-Technical",
  isPaid: true,
  price: 20,
  college: "Symbiosis Pune",
  bannerUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  maxCapacity: 100,
  description: `🗺️ Find the hidden treasure!
  Solve clues, race against teams and unlock mysteries 🏃‍♂️🔍

  🧩 Teams of 3
  📍 Multiple checkpoints
  ⏱️ Fastest team wins

  🏆 Exciting goodies & prizes 🎁
  📜 Participation certificates

  ⚡ Adventure awaits!`
},
{
  title: "AI WORKSHOP",
  date: "2026-01-24",
  startTime: "9:30 AM",
  venue: "Auditorium",
  category: "Technical",
  isPaid: true,
  price: 150,
  college: "IISc Bangalore",
  bannerUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
  maxCapacity: 120,
  description: `🤖 Enter the world of Artificial Intelligence!
  Learn how AI models work and build your first ML project 🧠💡

  📘 Topics:
  • Machine Learning
  • Neural Networks
  • Real-life AI use cases

  🏆 E-Certificates & hands-on training
  🚀 Boost your tech career!`
},
{
  title: "E-SPORTS TOURNAMENT",
  date: "2026-01-24",
  startTime: "1:00 PM",
  venue: "Gaming Zone",
  category: "Non-Technical",
  isPaid: true,
  price: 100,
  college: "Amity University",
  bannerUrl: "https://images.unsplash.com/photo-1605902711622-cfb43c44367f",
  maxCapacity: 64,
  description: `🎮 Let the battle begin!
  Compete in high-intensity gaming tournaments with top players 🔥

  🕹️ Games: BGMI, Valorant, FIFA
  👥 Team & Solo modes

  🏆 Cash prizes + trophies 🏆
  📜 Participation certificates

  💥 Game. Compete. Win!`
},
{
  title: "BUSINESS QUIZ",
  date: "2026-01-25",
  startTime: "11:00 AM",
  venue: "Room 201",
  category: "Non-Technical",
  isPaid: false,
  price: 0,
  college: "SP Jain Mumbai",
  bannerUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
  maxCapacity: 60,
  description: `📊 Think like a CEO!
  Test your business and finance knowledge 💼📈

  👥 Teams of 2
  🧠 Rapid fire & buzzer rounds

  🏆 Winners get prizes
  📜 Certificates for all

  🚀 Become the business champion!`
},
{
  title: "HACKATHON",
  date: "2026-01-25",
  startTime: "9:00 AM",
  venue: "Innovation Lab",
  category: "Technical",
  isPaid: true,
  price: 200,
  college: "BITS Pilani",
  bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  maxCapacity: 150,
  description: `💻 24-Hour Coding Marathon!
  Build innovative solutions to real-world problems 🚀

  👥 Teams of 3-4
  🧠 Mentorship provided
  ⏱️ Non-stop coding

  🏆 Big cash prizes + internships 🎉
  📜 Certificates for all hackers`
},
{
  title: "PHOTOGRAPHY WALK",
  date: "2026-01-26",
  startTime: "8:00 AM",
  venue: "College Garden",
  category: "Non-Technical",
  isPaid: true,
  price: 30,
  college: "St. Xavier's College",
  bannerUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
  maxCapacity: 40,
  description: `📸 Capture the beauty around you!
  Join our guided photography walk 🌿✨

  📷 DSLR or Mobile allowed
  🧑‍🏫 Expert guidance

  🏆 Best photo wins prizes
  📜 Participation certificates

  🌈 Freeze moments forever!`
},
{
  title: "DATA SCIENCE QUIZ",
  date: "2026-01-26",
  startTime: "12:00 PM",
  venue: "Lab 5",
  category: "Technical",
  isPaid: false,
  price: 0,
  college: "IIT Madras",
  bannerUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
  maxCapacity: 70,
  description: `📊 Numbers meet knowledge!
  Test your data science and analytics skills 🧠📉

  👥 Teams of 2
  📈 MCQs + Case study rounds

  🏆 Prizes for top scorers
  📜 Certificates for all

  🚀 Decode data like a pro!`
},
{
  title: "MARKETING MADNESS",
  date: "2026-01-27",
  startTime: "11:30 AM",
  venue: "Room 305",
  category: "Non-Technical",
  isPaid: true,
  price: 40,
  college: "IMT Ghaziabad",
  bannerUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
  maxCapacity: 60,
  description: `📢 Sell it like a pro!
  Showcase your marketing and branding skills 🎯

  👥 Teams of 2
  🧠 Case studies & ad creation

  🏆 Exciting rewards
  📜 Certificates for all

  🚀 Become the marketing king!`
},
{
  title: "UI UX CHALLENGE",
  date: "2026-01-27",
  startTime: "2:00 PM",
  venue: "Design Lab",
  category: "Technical",
  isPaid: true,
  price: 60,
  college: "NID Ahmedabad",
  bannerUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d",
  maxCapacity: 50,
  description: `🎨 Design like a pro!
  Create stunning user interfaces for given problems 🖌️✨

  🖥️ Tools allowed
  👨‍🎨 Solo participation

  🏆 Prizes & certificates
  🚀 Design your way to victory!`
},
{
  title: "FINANCE SIMULATION",
  date: "2026-01-28",
  startTime: "10:30 AM",
  venue: "Auditorium",
  category: "Non-Technical",
  isPaid: true,
  price: 70,
  college: "IIM Ahmedabad",
  bannerUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938",
  maxCapacity: 80,
  description: `💰 Play the stock market!
  Experience real-time trading simulation 📈

  👥 Teams of 2
  ⏱️ Live market tracking

  🏆 Best investors win
  📜 Certificates for all

  🚀 Grow your virtual wealth!`
},
{
  title: "APP DEV CONTEST",
  date: "2026-01-28",
  startTime: "1:00 PM",
  venue: "Computer Center",
  category: "Technical",
  isPaid: false,
  price: 0,
  college: "IIIT Hyderabad",
  bannerUrl: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f",
  maxCapacity: 90,
  description: `📱 Build the next big app!
  Develop innovative mobile applications 🚀

  👥 Teams of 3
  ⏱️ 4 hours challenge

  🏆 Prizes & certificates
  💡 Turn ideas into apps!`
},
{
  title: "PERSONALITY WORKSHOP",
  date: "2026-01-29",
  startTime: "10:00 AM",
  venue: "Conference Hall",
  category: "Non-Technical",
  isPaid: true,
  price: 50,
  college: "Christ University",
  bannerUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  maxCapacity: 100,
  description: `🧠 Boost your confidence!
  Learn communication, leadership & body language 💬✨

  🧑‍🏫 Expert trainers
  📝 Interactive activities

  📜 Certificates provided
  🚀 Level up your personality!`
},
{
  title: "CYBER SECURITY TALK",
  date: "2026-01-29",
  startTime: "2:00 PM",
  venue: "Auditorium",
  category: "Technical",
  isPaid: false,
  price: 0,
  college: "IIT Kanpur",
  bannerUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7",
  maxCapacity: 150,
  description: `🔐 Stay safe online!
  Learn how hackers think and how to protect yourself 🛡️

  🧑‍💻 Live demos
  📜 E-Certificates

  🚀 Secure your digital future!`
},
{
  title: "CULTURAL NIGHT",
  date: "2026-01-30",
  startTime: "6:00 PM",
  venue: "Open Ground",
  category: "Non-Technical",
  isPaid: true,
  price: 100,
  college: "Delhi University",
  bannerUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
  maxCapacity: 500,
  description: `🎤 Dance. Sing. Celebrate!
  A night full of music, dance and performances 🎶💃

  🌟 Live bands
  🍔 Food stalls

  🏆 Fun games & prizes
  🎉 Enjoy an unforgettable night!`
},
{
  title: "VR EXPERIENCE ZONE",
  date: "2026-01-30",
  startTime: "11:00 AM",
  venue: "Tech Pavilion",
  category: "Technical",
  isPaid: true,
  price: 80,
  college: "SRM University",
  bannerUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620",
  maxCapacity: 70,
  description: `🕶️ Enter the virtual world!
  Experience immersive VR games and simulations 🌐

  🎮 Multiple VR setups
  🤯 Mind-blowing experience

  🏆 Fun rewards
  🚀 Step into the future!`
}

];

// ======================================================
// SEED FUNCTION
// ======================================================
const seedDB = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    // Find or Create Admin Organizer
    let admin = await Organizer.findOne({ email: "admin@technirman.com" });

    if (!admin) {
      admin = await Organizer.create({
        name: "TechNirman Admin",
        college: COLLEGE_NAME,
        email: "admin@technirman.com",
        password: "admin",
        mobile: "0000000000"
      });
      console.log("👤 Admin organizer created");
    }

    // Clear old data
    await Event.deleteMany({});
    console.log("🗑 Old events removed");

    // Attach organizer
    const finalEvents = events.map(e => ({
      ...e,
      organizer: admin._id
    }));

    // Insert
    await Event.insertMany(finalEvents);
    console.log(`🚀 ${finalEvents.length} Events Seeded Successfully`);

    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();
