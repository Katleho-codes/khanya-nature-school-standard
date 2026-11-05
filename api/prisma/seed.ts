import fs from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../src/db.js";
import { env } from "../src/env.js";
import { uploadPath } from "../src/lib/uploads.js";

const DAY = 24 * 60 * 60 * 1000;

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY);
}

function saDay(offsetDays: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
  }).format(addDays(new Date(), offsetDays));
}

function saAt(offsetDays: number, time: string): Date {
  return new Date(`${saDay(offsetDays)}T${time}:00+02:00`);
}

const hours = {
  monday: { open: "07:00", close: "17:00" },
  tuesday: { open: "07:00", close: "17:00" },
  wednesday: { open: "07:00", close: "17:00" },
  thursday: { open: "07:00", close: "17:00" },
  friday: { open: "07:00", close: "17:00" },
  saturday: null,
  sunday: null,
};

type ImageSeed = {
  name: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

const imageSeeds: ImageSeed[] = [
  {
    name: "hero-home",
    alt: "Children walking in a line along a leafy garden path at the Randburg branch",
    width: 1200,
    height: 1500,
    caption: "Photo: children walking the garden path at Randburg",
  },
  {
    name: "founder-naledi",
    alt: "Naledi Botha, founder of Khanya Nature School, standing in the vegetable garden",
    width: 1200,
    height: 1500,
    caption: "Photo: Naledi Botha in the vegetable garden",
  },
  {
    name: "about-outdoor-classroom",
    alt: "A shaded outdoor classroom with wooden benches and a low table of natural materials",
    width: 1800,
    height: 1200,
    caption: "Photo: the outdoor classroom under the trees",
  },
  {
    name: "programme-little-explorers",
    alt: "Two toddlers scooping water and sand at a low wooden table",
    width: 1800,
    height: 1200,
    caption: "Photo: toddlers at the water and sand table",
  },
  {
    name: "programme-forest-kindy",
    alt: "A small group of three year olds building a den from branches and cloth",
    width: 1800,
    height: 1200,
    caption: "Photo: children building a den from loose branches",
  },
  {
    name: "programme-bush-school",
    alt: "Four year olds writing in nature journals on a grassy bank",
    width: 1800,
    height: 1200,
    caption: "Photo: nature journals on the grassy bank",
  },
  {
    name: "programme-grade-r-pathfinders",
    alt: "Grade R children measuring a sunflower with a wooden ruler",
    width: 1800,
    height: 1200,
    caption: "Photo: Grade R children measuring sunflowers",
  },
  {
    name: "programme-holiday",
    alt: "Children painting with mud and berry dye at a long outdoor table",
    width: 1800,
    height: 1200,
    caption: "Photo: mud and berry painting at the holiday programme",
  },
  {
    name: "branch-randburg",
    alt: "The garden at the Randburg branch with mature trees and a small chicken run",
    width: 1920,
    height: 1080,
    caption: "Photo: the garden and chicken run at Randburg",
  },
  {
    name: "branch-fourways",
    alt: "A wetland garden and fire circle at the Fourways branch",
    width: 1920,
    height: 1080,
    caption: "Photo: the wetland garden and fire circle at Fourways",
  },
  {
    name: "branch-midstream",
    alt: "A new garden with young trees and a paved play area at Midstream",
    width: 1920,
    height: 1080,
    caption: "Photo: the new garden at Midstream",
  },
  {
    name: "team-naledi",
    alt: "Portrait of Naledi Botha, founder and principal",
    width: 900,
    height: 900,
    caption: "Photo: Naledi Botha, founder",
  },
  {
    name: "team-sipho",
    alt: "Portrait of Sipho Dlamini, outdoor educator at Fourways",
    width: 900,
    height: 900,
    caption: "Photo: Sipho Dlamini, outdoor educator",
  },
  {
    name: "team-thandi",
    alt: "Portrait of Thandi Mokoena, lead teacher for Bush School",
    width: 900,
    height: 900,
    caption: "Photo: Thandi Mokoena, Bush School teacher",
  },
  {
    name: "team-lerato",
    alt: "Portrait of Lerato Moloi, early years teacher at Randburg",
    width: 900,
    height: 900,
    caption: "Photo: Lerato Moloi, early years teacher",
  },
  {
    name: "news-garden-term4",
    alt: "Rows of spinach, beans and tomatoes in the school vegetable garden",
    width: 1800,
    height: 1200,
    caption: "Photo: the vegetable beds at Randburg",
  },
  {
    name: "news-sipho",
    alt: "Sipho Dlamini showing children how to hold a garden fork",
    width: 1800,
    height: 1200,
    caption: "Photo: Sipho Dlamini in the garden",
  },
  {
    name: "news-fire-circle",
    alt: "Families sitting around a small fire circle at dusk",
    width: 1800,
    height: 1200,
    caption: "Photo: a fire circle evening at Fourways",
  },
  {
    name: "news-parking",
    alt: "The drop-off gate and parking area at the Randburg branch",
    width: 1800,
    height: 1200,
    caption: "Photo: the drop-off gate at Randburg",
  },
  {
    name: "news-open-days",
    alt: "An open day table with seed packets, nature journals and tea",
    width: 1800,
    height: 1200,
    caption: "Photo: an open day welcome table",
  },
  {
    name: "news-heritage",
    alt: "Children and parents sharing food on blankets under trees",
    width: 1800,
    height: 1200,
    caption: "Photo: the Heritage Day picnic",
  },
  {
    name: "news-graduation",
    alt: "Grade R children in paper hats standing under a tree",
    width: 1800,
    height: 1200,
    caption: "Photo: Grade R graduation under the trees",
  },
  {
    name: "og-default",
    alt: "Khanya Nature School garden with children playing in the distance",
    width: 1200,
    height: 630,
    caption: "Photo: the Khanya garden",
  },
  {
    name: "admissions-visit",
    alt: "A teacher showing a parent and child the mud kitchen",
    width: 1800,
    height: 1200,
    caption: "Photo: a family visit to the mud kitchen",
  },
];

const gallerySeeds: Record<
  string,
  { title: string; description: string; branch: string | null; takenOn: string; photos: string[] }
> = {
  garden: {
    title: "The garden through the year",
    description:
      "Beans on the teepee, spinach that survived the cold, and the first tomatoes. The garden is the children's main classroom.",
    branch: "randburg",
    takenOn: saDay(-40),
    photos: [
      "Filling the watering cans at the rain tank",
      "A row of bean seedlings against the fence",
      "Thandi showing a handful of compost worms",
      "The first tomatoes, still green on the vine",
      "Children carrying a basket of spinach to the kitchen",
      "Measuring a sunflower taller than the door",
      "Planting garlic cloves with small fingers",
      "A ladybird on a broad bean leaf",
      "The herb spiral after the spring rain",
      "A child's drawing of the garden pinned to the shed",
    ],
  },
  "mud-kitchen": {
    title: "Mud kitchen mornings",
    description:
      "Water, clay, sand, old pots and time. The mud kitchen is where most of our mathematics happens without anyone calling it mathematics.",
    branch: "randburg",
    takenOn: saDay(-65),
    photos: [
      "A pot of thick clay soup on the mud stove",
      "Two children negotiating who holds the whisk",
      "Measuring water into a cracked jug",
      "A birthday cake of sand and leaves",
      "Mud handprints drying on the wooden counter",
      "A child carrying a bucket with both hands",
      "The sign-up board for the mud kitchen",
      "Washing pots in the outdoor sink",
    ],
  },
  seasons: {
    title: "All weather, all year",
    description:
      "We go outside in the rain, the cold and the heat. These are the small adjustments that make a full day outdoors possible.",
    branch: null,
    takenOn: saDay(-95),
    photos: [
      "Rain boots lined up at the door",
      "Children in waterproofs crossing the wet lawn",
      "A tray of ice and leaves on a winter morning",
      "The shade cloth over the sandpit in February",
      "Steam rising from a pot of soup at lunch",
      "A child holding a broad leaf as an umbrella",
      "The fire circle prepared for a cold morning",
      "Drying wet woolly hats on a wooden rack",
      "Bare branches reflected in a puddle",
    ],
  },
  events: {
    title: "Open days, picnics and graduations",
    description:
      "The days when families fill the garden. A few photographs from the last year of gatherings.",
    branch: null,
    takenOn: saDay(-20),
    photos: [
      "A parent reading a picture book on the grass",
      "The welcome table with tea and seed packets",
      "Children showing grandparents the chicken run",
      "A long table set for the Heritage Day picnic",
      "Grade R children waiting for their names",
      "A paper hat catching the wind",
      "Families walking the wetland path at Fourways",
      "A toddler asleep on a picnic blanket",
      "The fire circle lit for the evening",
      "Cake cut into small squares on a wooden board",
    ],
  },
  branches: {
    title: "Two gardens, two rhythms",
    description:
      "Randburg has the chickens and the big trees. Fourways has the wetland, the fynbos patch and the fire circle. Both are outdoors first.",
    branch: null,
    takenOn: saDay(-50),
    photos: [
      "The chicken run at Randburg in the morning",
      "The wetland boardwalk at Fourways",
      "Children climbing the low fig tree at Randburg",
      "The fynbos patch coming into flower",
      "The mud kitchen under the eaves at Randburg",
      "The fire circle before a parent evening",
      "A rainwater tank beside the Randburg shed",
      "The sandpit and shade cloth at Fourways",
      "The gate and bicycle rack at Randburg",
    ],
  },
};

const docSeeds = [
  {
    filename: "admission-form.pdf",
    title: "Admission form 2027",
    description:
      "The form to complete once you have visited and decided to apply. Includes the family details, emergency contacts and consent sections.",
    category: "ADMISSION_FORM" as const,
    sortOrder: 1,
    downloadCount: 34,
    heading: "Khanya Nature School: Admission Form 2027",
    sections: [
      {
        heading: "Before you begin",
        lines: [
          "Please complete this form in black ink and return it to the branch office with a copy of your child's birth certificate and immunisation record.",
          "Admission is confirmed once the registration fee has been paid and the branch principal has signed the acceptance section.",
        ],
      },
      {
        heading: "1. Child details",
        lines: [
          "Full name: ______________________________________________",
          "Preferred name: _________________________________________",
          "Date of birth: ___________________________________________",
          "Home language: __________________________________________",
          "Programme applied for: Little Explorers / Forest Kindy / Bush School / Grade R Pathfinders",
          "Preferred starting date: __________________________________",
          "Branch: Randburg (Ferndale) / Fourways",
        ],
      },
      {
        heading: "2. Parent or guardian",
        lines: [
          "Full name: ______________________________________________",
          "Relationship to child: ____________________________________",
          "Mobile number: __________________________________________",
          "Email address: __________________________________________",
          "Home address: ___________________________________________",
          "Postal code: ____________________________________________",
        ],
      },
      {
        heading: "3. Second contact",
        lines: [
          "Full name: ______________________________________________",
          "Relationship to child: ____________________________________",
          "Mobile number: __________________________________________",
          "May this person collect your child? Yes / No",
        ],
      },
      {
        heading: "4. Health and consent",
        lines: [
          "Allergies or medical conditions we should know about:",
          "_________________________________________________________",
          "Doctor and telephone: ____________________________________",
          "Medical aid and membership number: _______________________",
          "I consent to emergency medical treatment if I cannot be reached: Yes / No",
          "I consent to photographs of my child being used in school communications: Yes / No",
          "I have read the fee schedule and the parent handbook: Yes / No",
        ],
      },
      {
        heading: "5. Signatures",
        lines: [
          "Parent or guardian signature: _____________________________",
          "Date: ____________________________________________________",
          "Received by (branch): ____________________________________",
          "Date received: ___________________________________________",
        ],
      },
    ],
  },
  {
    filename: "medical-dietary-form.pdf",
    title: "Medical and dietary form",
    description:
      "Tell us about allergies, dietary needs, medication and anything that helps your child have a safe, comfortable day.",
    category: "ADMISSION_FORM" as const,
    sortOrder: 2,
    downloadCount: 21,
    heading: "Medical and Dietary Information",
    sections: [
      {
        heading: "Child details",
        lines: [
          "Child's full name: _______________________________________",
          "Date of birth: ___________________________________________",
          "Branch and programme: ___________________________________",
        ],
      },
      {
        heading: "Allergies",
        lines: [
          "Please list every known allergy, including food, insect stings, pollen and medication.",
          "Allergy: ______________________________ Reaction: _____________",
          "Allergy: ______________________________ Reaction: _____________",
          "Allergy: ______________________________ Reaction: _____________",
          "Does your child carry an adrenaline auto-injector? Yes / No",
          "Where is it kept? ________________________________________",
        ],
      },
      {
        heading: "Dietary needs",
        lines: [
          "Vegetarian / vegan / halaal / kosher / other: ________________",
          "Foods your child does not eat: _____________________________",
          "Foods your child especially enjoys: ________________________",
          "On cooked lunch days we provide a hot vegetarian meal. Please note any concerns below.",
          "_________________________________________________________",
        ],
      },
      {
        heading: "Medication",
        lines: [
          "Medication name: _________________________________________",
          "Dose and time: ___________________________________________",
          "Is the medication kept at school? Yes / No",
          "Written instructions from the prescriber attached? Yes / No",
        ],
      },
      {
        heading: "Other information",
        lines: [
          "Please tell us anything else that helps your child feel settled: anxiety, sensory needs, toileting, sleep, or a recent change at home.",
          "_________________________________________________________",
          "_________________________________________________________",
          "Parent signature: _____________________ Date: ______________",
        ],
      },
    ],
  },
  {
    filename: "fee-schedule-2027.pdf",
    title: "Fee schedule 2027",
    description:
      "Monthly fees, what they include, the registration fee and the notice period. One page, no surprises.",
    category: "FEE_SCHEDULE" as const,
    sortOrder: 3,
    downloadCount: 58,
    heading: "Fee Schedule 2027",
    sections: [
      {
        heading: "Monthly fees",
        lines: [
          "Little Explorers, 18 months to 3 years: R4 200 per month",
          "Forest Kindy, 3 to 4 years: R4 600 per month",
          "Bush School, Grade 00, 4 to 5 years: R4 900 per month",
          "Grade R Pathfinders, 5 to 6 years, Fourways only: R5 200 per month",
          "Fees are payable monthly in advance by the first working day of the month.",
        ],
      },
      {
        heading: "What is included",
        lines: [
          "Full day care from 07:00 to 17:00, Monday to Friday.",
          "A cooked vegetarian lunch on Tuesdays and Thursdays.",
          "All outdoor materials, garden supplies, art materials and nature journal.",
          "Two parent evenings a year and one written progress conversation per term.",
          "Sun cream and rain cover. Families provide a hat, water bottle, rain boots and a change of clothes.",
        ],
      },
      {
        heading: "Not included",
        lines: [
          "Breakfast and snacks. Families pack a morning snack, lunch on outdoor days, and an afternoon snack.",
          "Holiday programme days, charged at R450 per day.",
          "Once-off registration fee of R1 200 per family.",
        ],
      },
      {
        heading: "Attendance and notice",
        lines: [
          "Half day, 07:30 to 12:30, is available at 80 percent of the monthly fee.",
          "One calendar month's written notice is required when leaving, or the equivalent fee in lieu.",
          "Fees are reviewed each November for the following January.",
          "Sibling discount: 10 percent off the younger child's monthly fee.",
        ],
      },
      {
        heading: "Payment",
        lines: [
          "Bank: FNB Business, branch 250655",
          "Account name: Khanya Nature School",
          "Account number: 627 555 0142",
          "Reference: your child's surname and initial.",
          "Please email proof of payment to accounts@khanyanatureschool.example.",
        ],
      },
    ],
  },
  {
    filename: "what-to-bring.pdf",
    title: "What to bring and how to dress",
    description:
      "A practical list for the first day and every day after: clothes that can get muddy, a full water bottle, rain boots and a change of clothes.",
    category: "OTHER" as const,
    sortOrder: 4,
    downloadCount: 47,
    heading: "What to Bring and How to Dress",
    sections: [
      {
        heading: "Every day",
        lines: [
          "A named water bottle, filled. We refill it through the day.",
          "A wide-brimmed hat that stays on in the wind.",
          "Closed shoes that can get wet and muddy. No crocs or slip-slops.",
          "A full change of clothes in a named bag, including socks and underwear.",
          "A morning snack, a lunch on outdoor days, and an afternoon snack.",
          "A nature journal and a pencil case are provided. Please leave toys and screens at home.",
        ],
      },
      {
        heading: "On rainy days",
        lines: [
          "Waterproof jacket or rain suit.",
          "Rain boots that fit well enough to walk in.",
          "A dry set of clothes in a plastic bag.",
          "We go out unless there is lightning or dangerous wind. Please dress for the weather rather than keeping your child indoors.",
        ],
      },
      {
        heading: "On hot days",
        lines: [
          "A second water bottle on days above 30 degrees.",
          "A light long-sleeved shirt for sun protection.",
          "Sun cream applied at home. We reapply before outdoor play.",
        ],
      },
      {
        heading: "Please label everything",
        lines: [
          "Write your child's name on the inside of every item. We keep a lost property basket at each branch and empty it at the end of every term.",
          "We do not allow jewellery, watches, or clothing with cartoon characters. Uniform is a Khanya t-shirt, shorts or leggings, and closed shoes. The t-shirt is available from the office at R180.",
        ],
      },
    ],
  },
  {
    filename: "parent-handbook-summary.pdf",
    title: "Parent handbook summary",
    description:
      "The short version of how the school works: arrival, collection, illness, communication, birthdays and the things we ask of families.",
    category: "POLICY" as const,
    sortOrder: 5,
    downloadCount: 29,
    heading: "Parent Handbook: Summary",
    sections: [
      {
        heading: "Arrival and collection",
        lines: [
          "The gate opens at 07:00. Please say goodbye at the gate rather than in the garden, so the day can begin cleanly.",
          "Collection is between 16:30 and 17:00 for the full day. Half day collection is between 12:15 and 12:30.",
          "Only adults named on the admission form may collect a child. Send a message to the branch phone by 14:00 if someone else is coming.",
          "A late collection fee of R80 per 15 minutes applies after 17:00.",
        ],
      },
      {
        heading: "Illness",
        lines: [
          "Keep your child at home with a fever, vomiting, diarrhoea, or a cough that keeps them from playing.",
          "Children may return 24 hours after a fever has broken without medication, or 48 hours after the last episode of vomiting or diarrhoea.",
          "Please tell the branch the same morning if your child has a contagious illness such as chickenpox, hand foot and mouth, or ringworm.",
        ],
      },
      {
        heading: "Communication",
        lines: [
          "The branch sends a short WhatsApp message each Friday with the week's photographs and the following week's plans.",
          "Teachers are available for a conversation at collection, but longer conversations are booked for after 17:00 or at a parent evening.",
          "Please use the office email for admin and the branch phone for same-day messages.",
        ],
      },
      {
        heading: "Birthdays and treats",
        lines: [
          "We celebrate birthdays with a small song and a candle in a muffin at snack time. Please do not send party packs or balloons.",
          "If you would like to share a treat, send fruit or a small savoury snack for the class. Speak to the teacher first about allergies.",
        ],
      },
      {
        heading: "What we ask of families",
        lines: [
          "Send your child dressed for the weather, with clothes that can get dirty.",
          "Tell us when something has changed at home. A new baby, a move, or a difficult week shows up in play.",
          "Read the Friday message. It is the main way we share what is happening.",
          "Pay fees by the first working day of the month and speak to us early if that is difficult.",
        ],
      },
    ],
  },
  {
    filename: "school-calendar-2027.pdf",
    title: "School calendar 2027",
    description:
      "Term dates, public holidays, parent evenings, open mornings and the days the school closes for staff development.",
    category: "OTHER" as const,
    sortOrder: 6,
    downloadCount: 63,
    heading: "School Calendar 2027",
    sections: [
      {
        heading: "Terms",
        lines: [
          "Term 1: Wednesday 13 January to Friday 20 March",
          "Term 2: Tuesday 7 April to Friday 26 June",
          "Term 3: Monday 20 July to Friday 25 September",
          "Term 4: Monday 5 October to Friday 11 December",
          "The school closes at 12:30 on the last day of each term.",
        ],
      },
      {
        heading: "Public holidays",
        lines: [
          "The school is closed on all South African public holidays that fall on a weekday.",
          "We do not charge for public holidays, and no make-up days are offered.",
        ],
      },
      {
        heading: "Family dates",
        lines: [
          "Parent evening, Randburg: Thursday 25 February at 17:30",
          "Parent evening, Fourways: Tuesday 3 March at 17:30",
          "Open morning, Randburg: Saturday 14 March, 09:00 to 11:00",
          "Open morning, Fourways: Saturday 21 March, 09:00 to 11:00",
          "Heritage Day picnic, both branches: Thursday 24 September",
          "Grade R graduation, Fourways: Friday 4 December at 10:00",
        ],
      },
      {
        heading: "Staff development",
        lines: [
          "The school closes for staff development on Friday 27 March, Friday 3 July and Friday 2 October.",
          "Holiday programme runs in the June and December holidays. Booking opens four weeks before each holiday.",
        ],
      },
    ],
  },
];

async function wrapText(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  size: number,
  maxWidth: number,
): Promise<string[]> {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line.length > 0 ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line.length > 0) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line.length > 0) lines.push(line);
  return lines;
}

async function buildPdf(
  heading: string,
  sections: Array<{ heading: string; lines: string[] }>,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const forest = rgb(0.137, 0.224, 0.184);
  const bark = rgb(0.18, 0.165, 0.141);
  const ochre = rgb(0.851, 0.643, 0.255);

  let page = pdf.addPage([595.28, 841.89]);
  let cursor = 790;
  const left = 56;
  const maxWidth = 595.28 - left * 2;

  page.drawText("KHANYA NATURE SCHOOL", {
    x: left,
    y: 812,
    size: 9,
    font: bold,
    color: forest,
    characterSpacing: 1.5,
  });
  page.drawRectangle({ x: left, y: 800, width: 54, height: 2.5, color: ochre });
  cursor = 770;

  const titleLines = await wrapText(heading, bold, 20, maxWidth);
  for (const line of titleLines) {
    page.drawText(line, { x: left, y: cursor, size: 20, font: bold, color: forest });
    cursor -= 25;
  }
  cursor -= 8;

  for (const section of sections) {
    if (cursor < 110) {
      page = pdf.addPage([595.28, 841.89]);
      cursor = 780;
    }
    page.drawText(section.heading, {
      x: left,
      y: cursor,
      size: 12,
      font: bold,
      color: forest,
    });
    cursor -= 20;
    for (const paragraph of section.lines) {
      const lines = await wrapText(paragraph, regular, 9.5, maxWidth);
      for (const line of lines) {
        if (cursor < 70) {
          page = pdf.addPage([595.28, 841.89]);
          cursor = 780;
        }
        page.drawText(line, {
          x: left,
          y: cursor,
          size: 9.5,
          font: regular,
          color: bark,
        });
        cursor -= 14;
      }
      cursor -= 5;
    }
    cursor -= 10;
  }

  const footer = `Khanya Nature School, 8 Jacaranda Walk, Ferndale, Randburg, 2194  |  012 555 0142  |  khanyanatureschool.example`;
  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    item.drawText(footer, {
      x: left,
      y: 34,
      size: 7.5,
      font: regular,
      color: rgb(0.42, 0.47, 0.43),
    });
    item.drawText(`${index + 1} / ${pages.length}`, {
      x: 595.28 - left - 24,
      y: 34,
      size: 7.5,
      font: regular,
      color: rgb(0.42, 0.47, 0.43),
    });
  });

  return pdf.save();
}

async function resetDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.emailOutbox.deleteMany(),
    prisma.enquiryNote.deleteMany(),
    prisma.enquiry.deleteMany(),
    prisma.albumPhoto.deleteMany(),
    prisma.album.deleteMany(),
    prisma.document.deleteMany(),
    prisma.event.deleteMany(),
    prisma.post.deleteMany(),
    prisma.programmeBranch.deleteMany(),
    prisma.programme.deleteMany(),
    prisma.branch.deleteMany(),
    prisma.siteSettings.deleteMany(),
    prisma.media.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function makeUsers(): Promise<{ adminId: string; editorId: string }> {
  const seedAuth = betterAuth({
    appName: "Khanya Nature School Seed",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      minPasswordLength: 8,
    },
  });

  await seedAuth.api.signUpEmail({
    body: {
      name: "Naledi Botha",
      email: "admin@khanyanatureschool.example",
      password: env.SEED_ADMIN_PASSWORD,
    },
  });
  await seedAuth.api.signUpEmail({
    body: {
      name: "Zanele Ndlovu",
      email: "editor@khanyanatureschool.example",
      password: env.SEED_EDITOR_PASSWORD,
    },
  });

  const admin = await prisma.user.update({
    where: { email: "admin@khanyanatureschool.example" },
    data: { role: "admin", isActive: true, emailVerified: true },
  });
  const editor = await prisma.user.update({
    where: { email: "editor@khanyanatureschool.example" },
    data: { role: "editor", isActive: true, emailVerified: true },
  });

  return { adminId: admin.id, editorId: editor.id };
}

async function main(): Promise<void> {
  console.log("Resetting demo data...");
  await resetDatabase();

  const { adminId, editorId } = await makeUsers();

  console.log("Creating media records...");
  const mediaIds = new Map<string, string>();
  for (const image of imageSeeds) {
    const media = await prisma.media.create({
      data: {
        url: `/images/${image.name}.jpg`,
        originalName: `${image.name}.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: 280000,
        width: image.width,
        height: image.height,
        alt: image.alt,
        uploadedById: adminId,
      },
    });
    mediaIds.set(image.name, media.id);
  }

  const galleryMediaIds = new Map<string, string[]>();
  for (const [slug, album] of Object.entries(gallerySeeds)) {
    const ids: string[] = [];
    for (const [index, caption] of album.photos.entries()) {
      const name = `gallery-${slug}-${String(index + 1).padStart(2, "0")}`;
      const media = await prisma.media.create({
        data: {
          url: `/images/${name}.jpg`,
          originalName: `${name}.jpg`,
          mimeType: "image/jpeg",
          sizeBytes: 240000,
          width: 1800,
          height: 1200,
          alt: caption,
          uploadedById: adminId,
        },
      });
      ids.push(media.id);
    }
    galleryMediaIds.set(slug, ids);
  }

  console.log("Creating branches...");
  const randburg = await prisma.branch.create({
    data: {
      slug: "randburg",
      name: "Randburg (Ferndale)",
      tagline: "Big trees, chickens and a garden that changes every week.",
      addressLine1: "8 Jacaranda Walk",
      suburb: "Ferndale",
      city: "Randburg",
      province: "Gauteng",
      postalCode: "2194",
      lat: -26.0936,
      lng: 27.997,
      phone: "011 555 0114",
      whatsapp: "27115550114",
      email: "randburg@khanyanatureschool.example",
      hours: hours,
      description:
        "Our first branch sits on a quiet residential street in Ferndale, behind a row of mature jacarandas. The garden is the main room: a mud kitchen under the eaves, a small chicken run, raised vegetable beds, a fig tree with a low climbing branch, and a sandpit that stays shaded until lunchtime.\n\nThe indoor space is small on purpose. It holds the books, the art materials, the kitchen and the rest mats. Everything else happens outside. In winter we move the morning circle to the paved corner where the sun reaches first.\n\nWe walk to the corner shop on Fridays to buy fruit for the afternoon. The children know the route, the dogs behind the third gate, and the lady who sells bananas from a table on the pavement.",
      heroImageId: mediaIds.get("branch-randburg") ?? null,
      isActive: true,
      sortOrder: 1,
      seoTitle: "Randburg preschool: Khanya Nature School Ferndale",
      seoDescription:
        "A nature-based preschool in Ferndale, Randburg for children aged 18 months to 5 years. Garden days, small groups and unhurried time.",
    },
  });

  const fourways = await prisma.branch.create({
    data: {
      slug: "fourways",
      name: "Fourways",
      tagline: "A wetland garden, a fire circle and room to run.",
      addressLine1: "31 Wild Olive Road",
      suburb: "Fourways",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2055",
      lat: -26.017,
      lng: 28.009,
      phone: "011 555 0166",
      whatsapp: "27115550166",
      email: "fourways@khanyanatureschool.example",
      hours: hours,
      description:
        "The Fourways branch opens onto a wide garden with a shallow wetland at the bottom edge, a fynbos patch that the children planted in 2019, and a fire circle built from local stone. There is more open ground here than at Randburg, so the day has a little more running in it.\n\nThe wetland is fenced and watched. Children visit in small groups with a teacher, carrying magnifying glasses and a bucket for specimens that go back before lunch. In spring the frogs are loud enough to stop a conversation.\n\nGrade R Pathfinders is based here. The older children have their own long table under the olives, a tool bench with real hand tools, and a patch of garden they plan and plant themselves.",
      heroImageId: mediaIds.get("branch-fourways") ?? null,
      isActive: true,
      sortOrder: 2,
      seoTitle: "Fourways preschool and Grade R: Khanya Nature School",
      seoDescription:
        "Nature-based preschool and Grade R in Fourways, Johannesburg. Wetland garden, fire circle, small groups and a full day outdoors.",
    },
  });

  await prisma.branch.create({
    data: {
      slug: "midstream",
      name: "Midstream (coming soon)",
      tagline: "A new garden taking root in Midstream Estate.",
      addressLine1: "12 Acacia Bend",
      suburb: "Midstream Estate",
      city: "Centurion",
      province: "Gauteng",
      postalCode: "1692",
      lat: -25.9167,
      lng: 28.1833,
      phone: "012 555 0188",
      whatsapp: "27125550188",
      email: "midstream@khanyanatureschool.example",
      hours: hours,
      description:
        "We are preparing a third garden in Midstream Estate, due to open when the new trees have settled and the outdoor classroom is finished. The site has a north-facing lawn, space for a mud kitchen and a small orchard.\n\nEnquiries are open. Families who join the list will be invited to walk the site before we open, and will have first choice of places.",
      heroImageId: mediaIds.get("branch-midstream") ?? null,
      isActive: false,
      sortOrder: 3,
      seoTitle: "Midstream preschool opening soon: Khanya Nature School",
      seoDescription:
        "Khanya Nature School is preparing a new nature-based preschool in Midstream Estate, Centurion. Join the enquiry list.",
    },
  });

  console.log("Creating programmes...");
  const littleExplorers = await prisma.programme.create({
    data: {
      slug: "little-explorers",
      name: "Little Explorers",
      ageFromMonths: 18,
      ageToMonths: 36,
      ageLabel: "18 months to 3 years",
      summary:
        "A gentle first garden for toddlers: water, sand, clay, songs and a great deal of time to practise being two.",
      description:
        "Little Explorers is for children who are still learning that the world is safe and that adults come back. The group is small, never more than ten children with two teachers, and the rhythm is slow.\n\nMost of the morning happens outside on the covered patio and in the toddler garden. There is water, sand, clay, a low climbing frame, and a mud kitchen scaled to small hands. We sing the same welcome song every morning and read the same three books for a fortnight, because repetition is how this age learns.\n\nWe do not hurry toileting, eating or separating. Teachers work with each family on a plan that fits the child, and we keep the goodbye at the gate short and predictable.",
      dailyRhythm: [
        { time: "07:00", label: "Arrival, free play in the toddler garden" },
        { time: "08:15", label: "Morning circle and welcome song" },
        { time: "08:45", label: "Outdoor play: water, sand, clay, climbing" },
        { time: "10:00", label: "Snack and nappy change" },
        { time: "10:45", label: "Story and rest" },
        { time: "12:15", label: "Lunch" },
        { time: "13:00", label: "Quiet play and afternoon nap" },
        { time: "15:30", label: "Snack, garden walk, collection begins" },
      ],
      hoursLabel: "Full day 07:00 to 17:00, half day 07:30 to 12:30",
      monthlyFeeCents: 420000,
      feeNote: "Includes cooked lunch on Tuesdays and Thursdays.",
      imageId: mediaIds.get("programme-little-explorers") ?? null,
      isPublished: true,
      sortOrder: 1,
      seoTitle: "Little Explorers: toddlers 18 months to 3 years",
      seoDescription:
        "A gentle, outdoor-first toddler programme at Khanya Nature School in Randburg and Fourways. Small groups, slow days, R4 200 per month.",
      programmeBranches: {
        create: [
          { branchId: randburg.id },
          { branchId: fourways.id },
        ],
      },
    },
  });

  const forestKindy = await prisma.programme.create({
    data: {
      slug: "forest-kindy",
      name: "Forest Kindy",
      ageFromMonths: 36,
      ageToMonths: 48,
      ageLabel: "3 to 4 years",
      summary:
        "Den building, mud, insects and the first real friendships. A year of doing things with other people.",
      description:
        "Forest Kindy is where the social world opens up. Children build dens in the same corner of the garden for weeks, negotiate who carries the long branch, and learn that a game can continue tomorrow.\n\nTeachers introduce tools slowly: a hand drill, a small saw, a potato peeler at the cooking table. We teach the hold before the tool. The garden offers problems that are worth solving: how to get water to the far bed, how to make a bridge over the muddy patch, how to keep the chickens out of the seedlings.\n\nEarly literacy and numeracy are woven into the day rather than taught in a separate block. We count beans, write labels for the garden, read the weather chart, and tell the same story until the children can join in with the repeated line.",
      dailyRhythm: [
        { time: "07:00", label: "Arrival and garden jobs" },
        { time: "08:00", label: "Morning circle: weather, plan for the day" },
        { time: "08:30", label: "Long outdoor session: dens, garden, tools" },
        { time: "10:15", label: "Snack under the trees" },
        { time: "10:45", label: "Project work: cooking, building, mapping" },
        { time: "12:15", label: "Lunch and rest" },
        { time: "13:30", label: "Quiet table: books, drawing, puzzles" },
        { time: "14:30", label: "Afternoon outdoor play and collection" },
      ],
      hoursLabel: "Full day 07:00 to 17:00, half day 07:30 to 12:30",
      monthlyFeeCents: 460000,
      feeNote: "Includes all materials and a cooked lunch twice a week.",
      imageId: mediaIds.get("programme-forest-kindy") ?? null,
      isPublished: true,
      sortOrder: 2,
      seoTitle: "Forest Kindy: preschool for 3 to 4 year olds",
      seoDescription:
        "Outdoor preschool for 3 to 4 year olds at Khanya Nature School. Den building, garden projects and small groups in Randburg and Fourways.",
      programmeBranches: {
        create: [
          { branchId: randburg.id },
          { branchId: fourways.id },
        ],
      },
    },
  });

  const bushSchool = await prisma.programme.create({
    data: {
      slug: "bush-school",
      name: "Bush School (Grade 00)",
      ageFromMonths: 48,
      ageToMonths: 60,
      ageLabel: "4 to 5 years",
      summary:
        "A year of bigger projects, longer walks and the quiet confidence that comes from knowing a place well.",
      description:
        "Bush School is the Grade 00 year. The children know the garden intimately by now, so we ask more of them. They plan a bed, keep a nature journal, cook over the fire, and walk further: to the wetland at Fourways, to the pavement garden at Randburg, to the library on a Friday.\n\nThe group has a long project each term. Recent projects have included building a bench from reclaimed wood, mapping every tree on the property, and growing enough spinach to make soup for the whole school. The work is real and the outcome is visible.\n\nWe prepare children for Grade R without turning the year into a worksheet. By the end of Bush School most children can write their name, count confidently to twenty, recognise the sounds that begin familiar words, and sit with a problem for longer than they could a year ago.",
      dailyRhythm: [
        { time: "07:00", label: "Arrival and independent garden work" },
        { time: "07:50", label: "Morning meeting and project plan" },
        { time: "08:20", label: "Outdoor project session" },
        { time: "10:00", label: "Snack and nature journal" },
        { time: "10:45", label: "Small group literacy and numeracy" },
        { time: "12:00", label: "Lunch" },
        { time: "13:00", label: "Rest and quiet reading" },
        { time: "14:00", label: "Free play, garden chores, collection" },
      ],
      hoursLabel: "Full day 07:00 to 17:00, half day 07:30 to 12:30",
      monthlyFeeCents: 490000,
      feeNote: "Includes a nature journal, tools and a cooked lunch twice a week.",
      imageId: mediaIds.get("programme-bush-school") ?? null,
      isPublished: true,
      sortOrder: 3,
      seoTitle: "Bush School Grade 00: 4 to 5 year olds",
      seoDescription:
        "Grade 00 at Khanya Nature School: real projects, garden work, early literacy and numeracy, and a full day outdoors in Randburg and Fourways.",
      programmeBranches: {
        create: [
          { branchId: randburg.id },
          { branchId: fourways.id },
        ],
      },
    },
  });

  const pathfinders = await prisma.programme.create({
    data: {
      slug: "grade-r-pathfinders",
      name: "Grade R Pathfinders",
      ageFromMonths: 60,
      ageToMonths: 72,
      ageLabel: "5 to 6 years",
      summary:
        "The final preschool year at Fourways: real tools, long walks and a confident handover to primary school.",
      description:
        "Grade R Pathfinders is based at Fourways, where the open ground and the wetland give the oldest children somewhere to stretch. The year is designed to close the gap between preschool and primary school without losing the outdoor day.\n\nChildren keep a daily journal, read in pairs, work with numbers to fifty, and take on a weekly responsibility: the tool bench, the compost, the library bag, the welcome garden. They plan and cook a meal over the fire once a term. They walk to the wetland in small groups and record what has changed.\n\nIn the last term we visit the local primary schools, practise the walk to the gate, and talk honestly about what will be different. Teachers write a detailed handover for each child's new school, with permission from families.",
      dailyRhythm: [
        { time: "07:00", label: "Arrival, journal and garden responsibility" },
        { time: "07:45", label: "Morning meeting and shared reading" },
        { time: "08:15", label: "Literacy and numeracy groups" },
        { time: "09:45", label: "Snack and outdoor project" },
        { time: "10:30", label: "Long walk or wetland study" },
        { time: "12:15", label: "Lunch" },
        { time: "13:00", label: "Quiet reading and rest" },
        { time: "14:00", label: "Project work, free play, collection" },
      ],
      hoursLabel: "Full day 07:00 to 17:00, half day 07:30 to 12:30",
      monthlyFeeCents: 520000,
      feeNote: "Fourways only. Includes journal, tools and cooked lunch twice a week.",
      imageId: mediaIds.get("programme-grade-r-pathfinders") ?? null,
      isPublished: true,
      sortOrder: 4,
      seoTitle: "Grade R Pathfinders in Fourways: 5 to 6 year olds",
      seoDescription:
        "Grade R at Khanya Nature School in Fourways. A nature-based final preschool year with real projects, early literacy and a confident school handover.",
      programmeBranches: {
        create: [{ branchId: fourways.id }],
      },
    },
  });

  await prisma.programme.create({
    data: {
      slug: "holiday-programme",
      name: "Holiday Programme",
      ageFromMonths: 36,
      ageToMonths: 84,
      ageLabel: "3 to 7 years",
      summary:
        "School holiday days for Khanya families and their friends: whole days outside, a fire, a project and a lot of water play.",
      description:
        "The holiday programme runs in the June and December holidays, Monday to Friday, from 07:30 to 16:30. Children do not need to attend Khanya during term time. Each day has a loose theme: water, clay, fire, building, creatures, food from the garden.\n\nFamilies pack a morning snack, a lunch and a water bottle. We provide fruit in the afternoon and a cooked lunch on the two fire days. Children should bring a change of clothes, a hat and closed shoes that can get wet.\n\nGroups are mixed ages from 3 to 7, with a maximum of sixteen children and three teachers. Booking opens four weeks before the holiday and closes when the group is full.",
      dailyRhythm: [
        { time: "07:30", label: "Arrival and free play" },
        { time: "08:30", label: "Morning circle and theme for the day" },
        { time: "09:00", label: "Main project" },
        { time: "10:30", label: "Snack" },
        { time: "11:00", label: "Water play or long walk" },
        { time: "12:30", label: "Lunch" },
        { time: "13:15", label: "Quiet time and story" },
        { time: "14:00", label: "Afternoon project and free play" },
      ],
      hoursLabel: "07:30 to 16:30 on programme days",
      monthlyFeeCents: null,
      feeNote: "R450 per day. Book by the week or by the day.",
      imageId: mediaIds.get("programme-holiday") ?? null,
      isPublished: false,
      sortOrder: 5,
      seoTitle: "School holiday programme in Randburg and Fourways",
      seoDescription:
        "Outdoor school holiday days for children aged 3 to 7 at Khanya Nature School. Water, fire, clay, garden projects and long days outside.",
      programmeBranches: {
        create: [
          { branchId: randburg.id },
          { branchId: fourways.id },
        ],
      },
    },
  });

  console.log("Creating posts...");
  const postSeeds = [
    {
      slug: "term-4-in-the-garden",
      title: "Term 4 in the garden: what we are growing",
      excerpt:
        "The beans are climbing, the spinach has recovered, and the first tomatoes are still green. A note from the Randburg garden.",
      category: "NEWS" as const,
      branchId: randburg.id,
      isPinned: true,
      status: "PUBLISHED" as const,
      daysAgo: 3,
      cover: "news-garden-term4",
      bodyMd:
        "The garden changed its mind again this week. The beans we planted against the fence have found the top of the teepee, the spinach that looked finished after the cold has put out a whole new set of leaves, and the tomato plants are heavy with fruit that is still, stubbornly, green.\n\nTerm 4 is the busiest garden term. The children are harvesting every morning before circle, and the kitchen has started keeping a bowl by the sink for whatever comes in. On Tuesday we made a soup with the last of the carrots and a handful of herbs that the Bush School children cut themselves.\n\n## What is in the ground\n\n- Broad beans, planted in April, now taller than most of the children\n- Spinach, which we cut leaf by leaf and which keeps coming back\n- Tomatoes, three varieties, all still green\n- Carrots, which the Little Explorers pulled and washed in the outdoor sink\n- Garlic, planted by Grade R and not to be touched until December\n\n## What comes next\n\nThe Grade R children are planning a new bed for the summer. They have measured the space, argued about whether to plant mealies or sunflowers, and settled on both, in rows, with a path down the middle. The plan is on the shed wall in pencil.\n\nIf you have a spare afternoon, the compost heap always needs turning. Come and find a teacher.",
    },
    {
      slug: "notice-randburg-parking-drop-off",
      title: "Notice: Randburg parking during drop-off",
      excerpt:
        "A short request about the gate, the pavement and the neighbours while the road is being repaired.",
      category: "NOTICE" as const,
      branchId: randburg.id,
      isPinned: true,
      status: "PUBLISHED" as const,
      daysAgo: 2,
      cover: "news-parking",
      bodyMd:
        "The municipality is repairing the stormwater drain on the corner of Jacaranda Walk, which means the usual parking bay outside the gate is closed for the next three weeks.\n\nPlease use the side street for drop-off and walk your child to the gate. Do not stop in the yellow line or across the neighbour's driveway, even for a minute. We have had two complaints this week and we would like to keep the street on our side.\n\nThe gate will be staffed from 06:55. If you are running late, park properly and bring your child in through the office rather than leaving them at the gate.\n\nThank you for helping us keep the morning calm.",
    },
    {
      slug: "welcoming-sipho-dlamini",
      title: "Welcoming Sipho Dlamini as our outdoor educator",
      excerpt:
        "Sipho joins the Fourways team from a conservation education background, with a plan for the wetland and a good story about a tortoise.",
      category: "NEWS" as const,
      branchId: fourways.id,
      isPinned: false,
      status: "PUBLISHED" as const,
      daysAgo: 8,
      cover: "news-sipho",
      bodyMd:
        "Sipho Dlamini joined the Fourways team at the start of the term. He grew up in eMpangeni, trained as a field guide, and spent six years running conservation education programmes for primary schools before deciding that he wanted to work with younger children.\n\n\"The three year olds ask the best questions,\" he says. \"They are not trying to be clever. They actually want to know why the frog is sitting on that leaf.\"\n\nSipho is taking over the wetland visits and the tool bench. He has already started a specimen table by the door: a jar of pond water, a dried reed, a tortoise shell he found on a walk and brought in to show the children. The shell has been handled so much that it is now polished.\n\nHe is also teaching the children to be quiet in a particular way: not silent, but still enough to hear something. The first time it worked, the whole group heard a hadeda land on the roof.\n\nFamilies can meet Sipho at the Fourways open morning later this term.",
    },
    {
      slug: "fire-circle-evenings-return",
      title: "Fire circle evenings return",
      excerpt:
        "One Friday a month, families are invited to sit around the fire at Fourways. Bring something to braai and a story to tell.",
      category: "ANNOUNCEMENT" as const,
      branchId: fourways.id,
      isPinned: false,
      status: "PUBLISHED" as const,
      daysAgo: 26,
      cover: "news-fire-circle",
      bodyMd:
        "The fire circle evenings are back. On the last Friday of the month, from 17:30 to 19:00, families are welcome to stay after collection for a fire, a shared meal and a story or two.\n\nWe light the fire at 17:30. Bring something to braai, a plate to share, and a chair or blanket. We provide the fire, a pot of rooibos and the marshmallows.\n\nThese evenings are deliberately low-key. There is no programme and no performance. Children run in the last of the light, adults sit, and by 18:30 someone is usually telling a story they have told before.\n\nIf it rains, we move into the indoor room and cook on the gas stove. The fire circle is a fair-weather friend.\n\nThe first one is this month. Please let the office know if you are coming so we can plan the marshmallows.",
    },
    {
      slug: "spring-open-days",
      title: "Spring open days: come and walk the garden",
      excerpt:
        "Both branches open their gates on a Saturday morning for families who want to see the school at its most ordinary.",
      category: "ANNOUNCEMENT" as const,
      branchId: null,
      isPinned: false,
      status: "PUBLISHED" as const,
      daysAgo: 5,
      cover: "news-open-days",
      bodyMd:
        "We are opening both gardens on two Saturday mornings this spring. There will be tea, seed packets to take home, and teachers in the garden rather than behind a table.\n\nThe point of an open morning is not a presentation. It is to see the mud kitchen after a week of use, the state of the bean teepee, and the particular quality of noise that a group of four year olds makes when they are busy.\n\nYou do not need to book. Bring your child, wear shoes that can get wet, and stay as long as you like. If you would like to talk about a place, find Naledi or the branch principal.\n\nRandburg: Saturday at 09:00 at 8 Jacaranda Walk, Ferndale.\n\nFourways: the following Saturday at 09:00 at 31 Wild Olive Road.\n\nIf you cannot make a Saturday, call the branch and arrange a weekday morning visit instead. Those are the best visits, because the day is already in progress.",
    },
    {
      slug: "heritage-day-picnic",
      title: "Heritage Day picnic: a morning of stories and shared food",
      excerpt:
        "Blankets under the trees, a table of food from home, and three stories told in three languages.",
      category: "NEWS" as const,
      branchId: null,
      isPinned: false,
      status: "PUBLISHED" as const,
      daysAgo: 44,
      cover: "news-heritage",
      bodyMd:
        "Heritage Day at Khanya is a picnic, not a performance. Families bring a blanket and a plate of food that means something to them, and we put everything on a long table under the trees.\n\nThis year we had bobotie, biryani, vetkoek, three kinds of salad, a pot of samp and beans, and a great deal of cake. The children ate their way down the table and then went back for the things they had missed.\n\nAfter lunch, three parents told stories. One in isiZulu, one in Afrikaans, one in English. The children were still for the first story and less still for the third, which is a fair reflection of a Friday morning.\n\nWhat stays with me is the queue at the table. Children were not choosing only the food they knew. They were asking what things were, and the adults were answering, and by the end most plates had something new on them.\n\nWe will do it again next year. Bring a story as well as a plate.",
    },
    {
      slug: "a-slow-start-to-the-year",
      title: "A slow start to the year: why we protect the first weeks",
      excerpt:
        "We do not begin with worksheets in January. We begin by learning names, building trust and letting the garden show us what to do.",
      category: "NEWS" as const,
      branchId: null,
      isPinned: false,
      status: "PUBLISHED" as const,
      daysAgo: 70,
      cover: "about-outdoor-classroom",
      bodyMd:
        "Every January, parents ask some version of the same question: when will the children start doing proper work? The honest answer is that the first three weeks are the work.\n\nA child who is new to the school is learning a great deal: where the toilet is, which teacher will remember their name, whether the big tree is safe to climb, what happens when you drop your bowl. None of that appears on a worksheet.\n\nWe keep the first weeks deliberately quiet. The same small group, the same teacher, the same rhythm every day. We do not start the big projects until the children know where things live and who to ask for help.\n\nBy the end of February, something shifts. The new children are running to the gate in the morning. The older ones have absorbed them into the game. The garden is full of children who know what they are doing.\n\nThat is the foundation. The letters and numbers come more easily once it is in place.",
    },
    {
      slug: "grade-r-graduation-under-the-trees",
      title: "Grade R graduation: a morning under the trees",
      excerpt:
        "Eight children, a paper hat each, and a song that the parents joined in for the last verse.",
      category: "NEWS" as const,
      branchId: fourways.id,
      isPinned: false,
      status: "PUBLISHED" as const,
      daysAgo: 120,
      cover: "news-graduation",
      bodyMd:
        "The Grade R Pathfinders graduated on a Friday morning under the olive trees at Fourways. Eight children, a paper hat each, and a table of cake that the children had helped to bake the day before.\n\nEach child said what they would remember. Answers included the frog pond, the fire, the day the hose broke, and the smell of the compost. One child said, simply, \"my friends\", and sat down again.\n\nNaledi spoke about the year. She said that the measure of a good Grade R is not how many letters a child can write, but whether they can walk into a new room and ask for what they need. The parents clapped for a long time.\n\nThe children sang a song they had been practising for weeks. The last verse has a repeated line, and by the third time the parents had joined in.\n\nWe will miss them. The new Grade R group starts in January, and the garden will feel different again.",
    },
    {
      slug: "holiday-programme-december-dates",
      title: "Holiday programme: December dates and what to pack",
      excerpt:
        "Six days, three teachers, a water theme and a fire lunch. Here is what to send with your child.",
      category: "ANNOUNCEMENT" as const,
      branchId: null,
      isPinned: false,
      status: "DRAFT" as const,
      daysAgo: 1,
      cover: "programme-holiday",
      bodyMd:
        "The December holiday programme runs from Monday to Saturday in the second week of the holidays, 07:30 to 16:30, at the Randburg branch.\n\nThe theme this year is water: where it comes from, where it goes, and why the garden needs it. We will build a small filter, walk to the stream, paint with watery colours and cook a pot of soup on the fire on the last day.\n\n## What to pack\n\n- A named water bottle, filled\n- A morning snack, lunch and afternoon snack\n- A full change of clothes\n- Rain boots and a rain jacket\n- A hat\n- A towel on the water days\n\nR450 per day, or R2 200 for the full six days. Khanya families and their friends are welcome. Book with the office before the end of November.",
    },
  ];

  for (const seed of postSeeds) {
    await prisma.post.create({
      data: {
        slug: seed.slug,
        title: seed.title,
        excerpt: seed.excerpt,
        bodyMd: seed.bodyMd,
        coverId: mediaIds.get(seed.cover) ?? null,
        category: seed.category,
        branchId: seed.branchId,
        isPinned: seed.isPinned,
        status: seed.status,
        publishedAt: addDays(new Date(), -seed.daysAgo),
        authorId: adminId,
        seoTitle: seed.title,
        seoDescription: seed.excerpt.slice(0, 155),
      },
    });
  }

  console.log("Creating events...");
  const eventSeeds = [
    {
      slug: "term-4-welcome-coffee",
      title: "Term 4 welcome coffee",
      days: -14,
      time: "08:00",
      endTime: "09:30",
      allDay: false,
      location: "Randburg garden",
      branchId: randburg.id,
      cover: "news-open-days",
      published: true,
      description:
        "A relaxed coffee after drop-off to start the term. Come and meet the other families in your child's group. Younger siblings are welcome.",
    },
    {
      slug: "garden-harvest-morning",
      title: "Garden harvest morning",
      days: -28,
      time: "09:00",
      endTime: "11:00",
      allDay: false,
      location: "Fourways vegetable beds",
      branchId: fourways.id,
      cover: "news-garden-term4",
      published: true,
      description:
        "Families joined the children to harvest the last of the winter crop, turn the beds and plant a green manure. We finished with soup from the garden.",
    },
    {
      slug: "randburg-open-morning",
      title: "Randburg open morning",
      days: 9,
      time: "09:00",
      endTime: "11:00",
      allDay: false,
      location: "8 Jacaranda Walk, Ferndale, Randburg",
      branchId: randburg.id,
      cover: "news-open-days",
      published: true,
      description:
        "Walk the garden, meet the teachers and see the school in its ordinary Saturday state. Tea and seed packets. No booking needed.",
    },
    {
      slug: "fourways-open-morning",
      title: "Fourways open morning",
      days: 16,
      time: "09:00",
      endTime: "11:00",
      allDay: false,
      location: "31 Wild Olive Road, Fourways, Johannesburg",
      branchId: fourways.id,
      cover: "news-open-days",
      published: true,
      description:
        "An open morning at the Fourways garden, including the wetland path and the Grade R outdoor table. Tea, seed packets and teachers to answer questions.",
    },
    {
      slug: "parent-evening-reading-and-stories",
      title: "Parent evening: reading and stories",
      days: 23,
      time: "17:30",
      endTime: "19:00",
      allDay: false,
      location: "Randburg indoor room",
      branchId: randburg.id,
      cover: "about-outdoor-classroom",
      published: true,
      description:
        "A practical evening about reading with young children: what to read, how often, and what to do when they want the same book for the twentieth time. Tea and a short talk from Naledi.",
    },
    {
      slug: "spring-planting-day",
      title: "Spring planting day",
      days: 30,
      time: "08:30",
      endTime: "12:30",
      allDay: false,
      location: "Both branches",
      branchId: null,
      cover: "news-garden-term4",
      published: true,
      description:
        "The whole school plants the summer garden. Families are welcome from 08:30. Bring gloves, a hat and a spade if you have one. We finish with a shared lunch.",
    },
    {
      slug: "fire-circle-evening",
      title: "Fire circle evening",
      days: 37,
      time: "17:30",
      endTime: "19:00",
      allDay: false,
      location: "Fourways fire circle",
      branchId: fourways.id,
      cover: "news-fire-circle",
      published: true,
      description:
        "The monthly fire circle for families. Bring something to braai and a story to tell. Marshmallows provided. If it rains, we move indoors.",
    },
    {
      slug: "new-family-welcome-tea",
      title: "New family welcome tea",
      days: 44,
      time: "09:30",
      endTime: "10:30",
      allDay: false,
      location: "Fourways indoor room",
      branchId: fourways.id,
      cover: "news-open-days",
      published: true,
      description:
        "For families joining in the new year. Meet the teachers, ask the practical questions, and collect the welcome pack.",
    },
    {
      slug: "term-4-closes-early",
      title: "Term 4 closes early",
      days: 55,
      time: "07:00",
      endTime: "12:30",
      allDay: true,
      location: "Both branches",
      branchId: null,
      cover: null,
      published: true,
      description:
        "The last day of Term 4. School closes at 12:30. Holiday programme details will be sent by WhatsApp.",
    },
    {
      slug: "summer-holiday-programme-begins",
      title: "Summer holiday programme begins",
      days: 60,
      time: "07:30",
      endTime: "16:30",
      allDay: true,
      location: "Randburg branch",
      branchId: randburg.id,
      cover: "programme-holiday",
      published: true,
      description:
        "The December holiday programme starts. Six days of water, garden projects, clay and a fire lunch. Booking is essential.",
    },
    {
      slug: "grade-r-graduation",
      title: "Grade R graduation",
      days: 75,
      time: "10:00",
      endTime: "11:30",
      allDay: false,
      location: "Fourways garden",
      branchId: fourways.id,
      cover: "news-graduation",
      published: true,
      description:
        "The Grade R Pathfinders graduate under the olive trees. Families and siblings welcome. Cake afterwards, baked by the children.",
    },
    {
      slug: "heritage-day-picnic",
      title: "Heritage Day picnic",
      days: 80,
      time: "10:00",
      endTime: "13:00",
      allDay: false,
      location: "Both branches",
      branchId: null,
      cover: "news-heritage",
      published: true,
      description:
        "Bring a blanket and a plate of food that means something to your family. We share a long table, tell stories in different languages, and spend the morning in the garden.",
    },
  ];

  for (const seed of eventSeeds) {
    const startsAt = saAt(seed.days, seed.time);
    const endsAt = saAt(seed.days, seed.endTime);
    await prisma.event.create({
      data: {
        slug: seed.slug,
        title: seed.title,
        descriptionMd: seed.description,
        startsAt,
        endsAt,
        allDay: seed.allDay,
        locationText: seed.location,
        branchId: seed.branchId,
        coverId: seed.cover ? mediaIds.get(seed.cover) ?? null : null,
        isPublished: seed.published,
        seoTitle: seed.title,
        seoDescription: seed.description.slice(0, 155),
      },
    });
  }

  console.log("Creating albums...");
  for (const [slug, album] of Object.entries(gallerySeeds)) {
    const photos = galleryMediaIds.get(slug) ?? [];
    const branch =
      album.branch === "randburg"
        ? randburg.id
        : album.branch === "fourways"
          ? fourways.id
          : null;
    await prisma.album.create({
      data: {
        slug,
        title: album.title,
        description: album.description,
        coverId: photos[0] ?? null,
        branchId: branch,
        takenOn: new Date(album.takenOn),
        isPublished: true,
        photos: {
          create: photos.map((mediaId, index) => ({
            mediaId,
            caption: album.photos[index] ?? "",
            alt: `${album.photos[index] ?? ""} at Khanya Nature School`,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log("Generating PDF documents...");
  for (const doc of docSeeds) {
    const bytes = await buildPdf(doc.heading, doc.sections);
    await fs.writeFile(uploadPath(doc.filename), bytes);
    const media = await prisma.media.create({
      data: {
        url: `/uploads/${doc.filename}`,
        originalName: doc.filename,
        mimeType: "application/pdf",
        sizeBytes: bytes.length,
        width: null,
        height: null,
        alt: null,
        uploadedById: adminId,
      },
    });
    await prisma.document.create({
      data: {
        title: doc.title,
        description: doc.description,
        category: doc.category,
        mediaId: media.id,
        branchId: null,
        sortOrder: doc.sortOrder,
        isPublished: true,
        downloadCount: doc.downloadCount,
      },
    });
  }

  console.log("Creating enquiries...");
  const enquirySeeds = [
    {
      daysAgo: 1,
      parent: "Thandiwe Mokoena",
      email: "thandiwe.mokoena@example.com",
      phone: "082 555 0111",
      child: "Lesedi Mokoena",
      dob: "2024-02-18",
      branch: randburg,
      programme: littleExplorers,
      start: "2027-01",
      status: "NEW" as const,
      source: "WEBSITE" as const,
      message:
        "We live two streets away and would like to visit. Lesedi is 20 months and has been at home with her grandmother.",
      notes: [],
    },
    {
      daysAgo: 2,
      parent: "Pieter van der Merwe",
      email: "pieter.vdm@example.com",
      phone: "083 555 0142",
      child: "Anja van der Merwe",
      dob: "2022-06-04",
      branch: fourways,
      programme: forestKindy,
      start: "2027-01",
      status: "CONTACTED" as const,
      source: "WEBSITE" as const,
      message:
        "Anja has been at a creche in Bryanston and is ready for more outdoor time. We would like a morning visit.",
      notes: [
        "Called on Tuesday. Visit booked for the 14th at 09:00.",
      ],
    },
    {
      daysAgo: 4,
      parent: "Aisha Patel",
      email: "aisha.patel@example.com",
      phone: "081 555 0188",
      child: "Yusuf Patel",
      dob: "2021-11-22",
      branch: fourways,
      programme: pathfinders,
      start: "2027-01",
      status: "VISIT_ARRANGED" as const,
      source: "WEBSITE" as const,
      message:
        "We are moving from Durban in December. Yusuf will turn five in November and we would like him to do Grade R at Khanya.",
      notes: [
        "Confirmed the move date. Visit on the 21st, whole family coming.",
        "Asked about school handover reports. Sent the Grade R page.",
      ],
    },
    {
      daysAgo: 5,
      parent: "Sipho Ndlovu",
      email: "sipho.ndlovu@example.com",
      phone: "072 555 0133",
      child: "Ayanda Ndlovu",
      dob: "2023-08-09",
      branch: randburg,
      programme: littleExplorers,
      start: "2027-02",
      status: "CONTACTED" as const,
      source: "WHATSAPP" as const,
      message:
        "Enquired on WhatsApp about a place for Ayanda from February. Both parents work in Sandton.",
      notes: ["Sent fee schedule and the what to bring list."],
    },
    {
      daysAgo: 7,
      parent: "Lerato Dlamini",
      email: "lerato.dlamini@example.com",
      phone: "076 555 0166",
      child: "Bokang Dlamini",
      dob: "2022-01-30",
      branch: randburg,
      programme: bushSchool,
      start: "2027-01",
      status: "VISIT_ARRANGED" as const,
      source: "WEBSITE" as const,
      message:
        "Bokang is currently at a school in Blairgowrie but we are not happy with the amount of screen time. We want a visit.",
      notes: ["Visit booked for Thursday morning. Naledi will show them the Bush School table."],
    },
    {
      daysAgo: 9,
      parent: "Fatima Adams",
      email: "fatima.adams@example.com",
      phone: "084 555 0177",
      child: "Imraan Adams",
      dob: "2021-09-12",
      branch: fourways,
      programme: pathfinders,
      start: "2027-01",
      status: "ENROLLED" as const,
      source: "WALK_IN" as const,
      message:
        "Walked in after the open morning. Imraan loved the wetland. We would like to secure a place for Grade R.",
      notes: [
        "Application form received with birth certificate.",
        "Registration fee paid. Place confirmed for January.",
      ],
    },
    {
      daysAgo: 11,
      parent: "Johan Botha",
      email: "johan.botha@example.com",
      phone: "082 555 0199",
      child: "Mia Botha",
      dob: "2024-05-05",
      branch: fourways,
      programme: littleExplorers,
      start: "2027-03",
      status: "NEW" as const,
      source: "WEBSITE" as const,
      message:
        "Mia will be two in May. We are expecting a second baby in February and would like to start her gently.",
      notes: [],
    },
    {
      daysAgo: 13,
      parent: "Nomsa Khumalo",
      email: "nomsa.khumalo@example.com",
      phone: "071 555 0122",
      child: "Sibusiso Khumalo",
      dob: "2022-03-17",
      branch: randburg,
      programme: forestKindy,
      start: "2027-01",
      status: "NOT_PROCEEDING" as const,
      source: "PHONE" as const,
      message:
        "Called about a place but has accepted one closer to home in Melville.",
      notes: ["Followed up. They have accepted a place at another school. Keep on the mailing list for holiday programme."],
    },
    {
      daysAgo: 16,
      parent: "Riaan Pretorius",
      email: "riaan.pretorius@example.com",
      phone: "083 555 0155",
      child: "Liam Pretorius",
      dob: "2021-12-01",
      branch: fourways,
      programme: pathfinders,
      start: "2027-01",
      status: "CONTACTED" as const,
      source: "WEBSITE" as const,
      message:
        "Liam is at a Grade R elsewhere but we are considering a second year before big school. Is that possible?",
      notes: [
        "Explained that we do not usually take a second Grade R year. Booked a call with Naledi to discuss.",
      ],
    },
    {
      daysAgo: 19,
      parent: "Zanele Mthembu",
      email: "zanele.mthembu@example.com",
      phone: "079 555 0181",
      child: "Naledi Mthembu",
      dob: "2023-04-23",
      branch: randburg,
      programme: littleExplorers,
      start: "2027-01",
      status: "ENROLLED" as const,
      source: "WEBSITE" as const,
      message:
        "We visited in September and would like to confirm a place. Naledi turns three in April but is ready for the older group.",
      notes: [
        "Place confirmed in Little Explorers with a review in April.",
        "Deposit paid. Welcome pack sent.",
      ],
    },
    {
      daysAgo: 23,
      parent: "Kavitha Naidoo",
      email: "kavitha.naidoo@example.com",
      phone: "082 555 0144",
      child: "Aarav Naidoo",
      dob: "2022-07-14",
      branch: fourways,
      programme: bushSchool,
      start: "2027-01",
      status: "NEW" as const,
      source: "WEBSITE" as const,
      message:
        "Aarav is sensitive to noise and large groups. We are looking for a smaller environment. Can we visit on a quiet morning?",
      notes: ["Sent a gentle reply. Offered a Wednesday morning visit with Sipho."],
    },
    {
      daysAgo: 29,
      parent: "Lindiwe Sithole",
      email: "lindiwe.sithole@example.com",
      phone: "073 555 0120",
      child: "Thabo Sithole",
      dob: "2024-01-08",
      branch: randburg,
      programme: null,
      start: "2027-04",
      status: "VISIT_ARRANGED" as const,
      source: "WHATSAPP" as const,
      message:
        "We are expecting to move to Randburg in March. Looking for a place from April for our son, who will be two.",
      notes: ["Visit planned for after the move. Staying in touch by WhatsApp."],
    },
    {
      daysAgo: 34,
      parent: "Charl du Plessis",
      email: "charl.dup@example.com",
      phone: "084 555 0139",
      child: "Elsa du Plessis",
      dob: "2021-10-19",
      branch: fourways,
      programme: pathfinders,
      start: "2027-01",
      status: "CONTACTED" as const,
      source: "PHONE" as const,
      message:
        "Grandparent calling for the family. Elsa is currently at a school in Lonehill. They want a more outdoor Grade R.",
      notes: ["Spoke to the grandmother. Waiting for the parents to call back."],
    },
    {
      daysAgo: 41,
      parent: "Ayanda Nkosi",
      email: "ayanda.nkosi@example.com",
      phone: "078 555 0167",
      child: "Lwazi Nkosi",
      dob: "2023-02-02",
      branch: randburg,
      programme: forestKindy,
      start: "2027-01",
      status: "NEW" as const,
      source: "WEBSITE" as const,
      message:
        "We saw the open morning notice on Instagram. Lwazi is three and a half and loves being outside.",
      notes: [],
    },
  ];

  for (const [index, seed] of enquirySeeds.entries()) {
    const year = new Date().getFullYear();
    const createdAt = addDays(new Date(), -seed.daysAgo);
    await prisma.enquiry.create({
      data: {
        reference: `ENQ-${year}-${String(index + 1).padStart(4, "0")}`,
        parentName: seed.parent,
        email: seed.email,
        phone: seed.phone,
        childName: seed.child,
        childDateOfBirth: new Date(`${seed.dob}T00:00:00+02:00`),
        branchId: seed.branch.id,
        programmeId: seed.programme?.id ?? null,
        preferredStart: new Date(`${seed.start}-01T00:00:00+02:00`),
        message: seed.message,
        source: seed.source,
        consentPopia: true,
        consentAt: createdAt,
        status: seed.status,
        createdAt,
        updatedAt: createdAt,
        notes: {
          create: seed.notes.map((body, noteIndex) => ({
            authorId: adminId,
            body,
            createdAt: addDays(createdAt, noteIndex + 1),
            updatedAt: addDays(createdAt, noteIndex + 1),
          })),
        },
      },
    });
  }

  console.log("Creating site settings...");
  await prisma.siteSettings.create({
    data: {
      id: "site",
      schoolName: "Khanya Nature School",
      tagline: "Room to grow in the light.",
      defaultSeoTitle: "Khanya Nature School | Nature-based preschool in Randburg and Fourways",
      defaultSeoDescription:
        "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors. Small groups, unhurried time, real materials.",
      socialFacebook: "https://www.facebook.com/khanyanatureschool",
      socialInstagram: "https://www.instagram.com/khanyanatureschool",
      socialYoutube: null,
      ogImageId: mediaIds.get("og-default") ?? null,
      whatsappDefaultMessage:
        "Hello Khanya Nature School, I would like to know more about your programmes and how to arrange a visit.",
    },
  });

  await prisma.emailOutbox.createMany({
    data: [
      {
        to: "aisha.patel@example.com",
        subject: `We have your enquiry, ENQ-${new Date().getFullYear()}-0003`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;background:#F6F1E7;color:#2E2A24"><h1 style="font-family:Georgia,serif;color:#23392F">Thank you, Aisha</h1><p>Your enquiry has reached the Khanya team. We will reply within one working day.</p><p style="color:#5b6f62">Reference ENQ-${new Date().getFullYear()}-0003</p></div>`,
        text: `Thank you, Aisha. Your enquiry has reached the Khanya team. Reference ENQ-${new Date().getFullYear()}-0003.`,
        template: "enquiry-confirmation",
        relatedType: "Enquiry",
        relatedId: `ENQ-${new Date().getFullYear()}-0003`,
        createdAt: addDays(new Date(), -4),
        updatedAt: addDays(new Date(), -4),
      },
      {
        to: "fourways@khanyanatureschool.example",
        subject: `New website enquiry: Yusuf Patel (ENQ-${new Date().getFullYear()}-0003)`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;background:#F6F1E7;color:#2E2A24"><h1 style="font-family:Georgia,serif;color:#23392F">A new family has been in touch</h1><p>A new enquiry came in through the website for Fourways.</p></div>`,
        text: `A new enquiry came in through the website for Fourways. Reference ENQ-${new Date().getFullYear()}-0003.`,
        template: "enquiry-branch-notification",
        relatedType: "Enquiry",
        relatedId: `ENQ-${new Date().getFullYear()}-0003`,
        createdAt: addDays(new Date(), -4),
        updatedAt: addDays(new Date(), -4),
      },
    ],
  });

  console.log("\nSeed complete.");
  console.log("Demo credentials");
  console.log("  Admin:  admin@khanyanatureschool.example  /  " + env.SEED_ADMIN_PASSWORD);
  console.log("  Editor: editor@khanyanatureschool.example /  " + env.SEED_EDITOR_PASSWORD);
  console.log(`  Points of contact: ${randburg.name}, ${fourways.name}, Midstream (inactive)`);
  console.log(`  Editor account id: ${editorId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
