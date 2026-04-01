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

const events = [
  // ======================================================
  // DAY 1 (20th Jan 2026)
  // ======================================================
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
    description: `🎨 The Ultimate Frontend Challenge!
    Test your creativity and coding speed. Recreate a given design pixel-perfectly on the spot!

    📜 Rules & Format:
    • Tools: VS Code only. No other editors allowed.
    • Resources: Internet allowed only for images/assets.
    • Restrictions: No AI tools (ChatGPT/Gemini) or code generators.
    • Time Limit: 50 Minutes.
    • Judging: Based on design accuracy, responsiveness, and code quality.

    🏆 Prizes: Exciting Rewards for Top 3 Winners!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Jeetu Prasad: 93564 40357
    • Mayuri Pasi: 95884 00796`
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
    description: `⏪ Reverse Engineering Challenge!
    We give you the Output, you write the Code. Can you figure out the logic backward?

    📜 Rules & Format:
    • Language: C or C++ only.
    • Platform: VS Code.
    • Challenge: Write code that generates the exact provided output.
    • Restrictions: Strictly NO internet or unauthorized help.
    • Time Limit: 50 Minutes.

    🏆 Prizes: Exciting Rewards for Top 3 Winners!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Priya Sharma: 75585 84378
    • Sabihaa Pinjari: 88289 39407`
  },
  {
    title: "TECH QUIZ",
    date: "2026-01-20",
    startTime: "11:00 AM",
    venue: "Extension Room 108/109",
    category: "Non-Technical",
    isPaid: true,
    price: 30,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/tech-quiz.png",
    maxCapacity: 50,
    description: `🧠 The Ultimate Geek Battle!
    A high-octane buzzer round quiz testing your IT knowledge and tech trivia.

    📜 Rules & Format:
    • Team Size: Duo (2 Members).
    • Format: Buzzer Round. First to buzz gets to answer.
    • Timing: 30 seconds per question.
    • Scoring: +Points for correct, -Negative for wrong answers.
    • Restrictions: No mobile phones or smartwatches allowed.

    🏆 Prizes: Exciting Rewards for Top 2 Teams!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Siddhika Gaykar: 78756 50771
    • Sayali Utekar: 93598 05035`
  },
  {
    title: "LOGICLASH",
    date: "2026-01-20",
    startTime: "11:00 AM",
    venue: "THM Hall",
    category: "Non-Technical",
    isPaid: true,
    price: 30,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/logiclash.png",
    maxCapacity: 40,
    description: `🗣️ Debate: Logic vs. Rhetoric
    Defend your stance! A classic debate competition where logic rules supreme.

    📜 Rules & Format:
    • Team Size: Duo (2 Members).
    • Gameplay: One member speaks FOR the motion, one AGAINST.
    • Time: 4 Minutes total per team.
    • Language: English or Hindi.
    • Judging Criteria: Logic, Clarity, Relevance, and Confidence.

    🏆 Prizes: Award for the Best Team!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Bhumika Kolhe: 90041 73647
    • Muskaan Madaan: 98237 36562`
  },
  {
    title: "FIXATHON",
    date: "2026-01-20",
    startTime: "12:15 PM",
    venue: "IT Lab Room No. 107",
    category: "Technical",
    isPaid: true,
    price: 30,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/fixathon.png",
    maxCapacity: 60,
    description: `🐛 Debug & Dominate!
    You are given broken code full of bugs. Your mission: Fix it and make it run!

    📜 Rules & Format:
    • Language: C / C++.
    • Task: Identify syntax and logical errors in provided snippets.
    • Editor: VS Code only.
    • Time Limit: 50 Minutes.
    • Winning Criteria: Code must compile and produce the correct output.

    🏆 Prizes: Exciting Rewards for Top 3 Winners!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Suraj Kushwaha: 79729 61677
    • Reshmi Panicker: 73871 56339`
  },
  {
    title: "LOLGORITHM",
    date: "2026-01-20",
    startTime: "12:15 PM",
    venue: "IT Lab 120",
    category: "Non-Technical",
    isPaid: true,
    price: 40,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/lalgorithm.png",
    maxCapacity: 60,
    description: `😂 Meme Making Championship
    Turn technical pain into humor! Create the funniest memes on the spot.

    📜 Rules & Format:
    • Participation: Individual.
    • Topic: Provided on the spot (Tech/General/College Life).
    • Tools: Lab PC or your Personal Phone.
    • Restrictions: Strictly NO offensive, vulgar, or political content.
    • Judging: Creativity, Humor, and Relatability.

    🏆 Prizes: Exciting Rewards for Top 3 Winners!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Shravan K: 72762 39453
    • Vyshnav N: 78879 61909`
  },
  {
    title: "SLIDEZILLA",
    date: "2026-01-20",
    startTime: "12:15 PM",
    venue: "Extension Room 108/109",
    category: "Non-Technical",
    isPaid: true,
    price: 30,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/slidezilla.png",
    maxCapacity: 40,
    description: `🎤 PowerPoint Karaoke
    Present a slide deck you've NEVER seen before. Improvise, adapt, and sell the story!

    📜 Rules & Format:
    • Participation: Individual.
    • The Twist: You get a random PPT on the spot.
    • Time: 3 Minutes to present.
    • Language: Hindi or English.
    • Judging: Flow, Confidence, Humor, and Logic.

    🏆 Prizes: Exciting Rewards for Top 3 Winners!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Dashna Mudliyar: 87674 40581
    • Khushi Pulli: 93714 74250`
  },
  {
    title: "BGMI SHOWDOWN",
    date: "2026-01-20",
    startTime: "01:30 PM",
    venue: "Extension Classroom",
    category: "Non-Technical",
    isPaid: true,
    price: 100,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/bgmi.png",
    maxCapacity: 100,
    description: `🔫 Battlegrounds Mobile India Tournament
    Drop in, gear up, and be the last squad standing.

    📜 Rules & Format:
    • Participation: Squad (4 Players).
    • Mode: Custom Room Match.
    • Device: Mobile Only (Tablets/Emulators/Triggers = DQ).
    • Network: Bring your own data connection.
    • Fair Play: Hacking, teaming, or toxic behavior leads to immediate ban.

    🏆 Prizes: Rewards for Top 2 Squads!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Vivek Gupta: 84199 74962
    • Sahil: 84212 79743`
  },
  {
    title: "FIND YOUR FLAG",
    date: "2026-01-20",
    startTime: "01:30 PM",
    venue: "THM Hall & Campus",
    category: "Non-Technical",
    isPaid: true,
    price: 40,
    college: COLLEGE_NAME,
    bannerUrl: "/assets/events/find-your-flag.png",
    maxCapacity: 100,
    description: `🚩 Campus Treasure Hunt
    Solve riddles, decode clues, and race across the campus to find your flags!

    📜 Rules & Format:
    • Team Size: Duo (2) or Squad (4).
    • Objective: Find 4 flags of your assigned color.
    • Gameplay: Solving one riddle reveals the location of the next clue.
    • Restrictions: NO Mobile Phones or Internet allowed.
    • Winner: The team that completes the circuit fastest.

    🏆 Prizes: Rewards for First 2 Teams!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Mansi: 93210 08818
    • Minakshi: 70387 48759`
  },

  // ======================================================
  // DAY 2 (21st Jan 2026)
  // ======================================================
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
    description: `✏️ Pictionary with a Twist!
    Your partner draws, you guess. How good is your telepathy?

    📜 Rules & Format:
    • Team Size: Duo (2 Members).
    • Gameplay: One member draws a random word, the other guesses.
    • Restrictions: No numbers, alphabets, or verbal hints while drawing.
    • Time Limit: 60 Seconds to guess.
    • Forbidden: Electronic gadgets strictly prohibited.

    🏆 Prizes: Rewards for Top 2 Teams!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Heads:
    • Sanika Ghate: 91375 91235
    • Khushboo: 95792 38044`
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
    description: `🔄 The Tongue Twister Challenge
    Don't let your words get tangled! A test of speed and clarity.

    📜 Rules & Format:
    • Participation: Individual.
    • Task: Repeat a complex tongue twister 5 times continuously.
    • Criteria: Speed, Pronunciation, and Flow.
    • Structure: Multi-round elimination format.

    🏆 Prizes: Rewards for Top 2 Winners!
    📃 Certificates: E-Certificates for all participants.

    📞 Contact Event Head:
    • Prerana Gupta: 98344 68538`
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("✅ Database Connected");

    // 1. Find or Create Default Organizer
    let admin = await Organizer.findOne({ email: "admin@technirman.com" });
    if (!admin) {
      console.log("⚠️ No organizer found. Creating default 'TechNirman Admin'...");
      admin = await Organizer.create({
        name: "TechNirman Admin",
        college: COLLEGE_NAME,
        email: "admin@technirman.com",
        password: "admin",
        mobile: "0000000000"
      });
      console.log(`✅ Created Organizer: ${admin.email}`);
    }

    // 2. Clear old events
    await Event.deleteMany({});
    console.log("🗑️  Cleared existing events");

    // 3. Assign Organizer ID to all events
    const eventsWithOrganizer = events.map(e => ({
      ...e,
      organizer: admin._id
    }));

    // 4. Insert new events
    await Event.insertMany(eventsWithOrganizer);
    console.log("🚀 Successfully Seeded 11 Events (Clean Text Version)!");

    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();