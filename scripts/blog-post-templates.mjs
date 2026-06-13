/** Topic templates for LAF blog post generator. */

export const TOPICS = [
  "education",
  "career",
  "digital-literacy",
  "women-empowerment",
  "medical-checkups",
  "food-donation",
  "volunteering",
  "community",
];

export const TOPIC_META = {
  education: {
    label: "Children's Education",
    imageAlt: "Children learning together in a rural classroom in India",
    resources: [
      { href: "/library/khan-academy", label: "Khan Academy (free lessons)" },
      { href: "https://www.unicef.org/india/what-we-do/education", label: "UNICEF India — Education" },
      { href: "https://ncert.nic.in/", label: "NCERT learning resources" },
    ],
  },
  career: {
    label: "Career Guidance",
    imageAlt: "Young students exploring career options with a mentor",
    resources: [
      { href: "/library/scholarships", label: "LAF Scholarship Library" },
      { href: "https://www.nsdcindia.org/", label: "National Skill Development Corporation" },
      { href: "/volunteer", label: "Volunteer as a career mentor" },
    ],
  },
  "digital-literacy": {
    label: "Digital Literacy",
    imageAlt: "Students using computers in a community learning centre",
    resources: [
      { href: "/library", label: "LAF Learning Resource Library" },
      { href: "/library/scratch", label: "Scratch coding for beginners" },
      { href: "https://digitalindia.gov.in/", label: "Digital India initiative" },
    ],
  },
  "women-empowerment": {
    label: "Women's Empowerment",
    imageAlt: "Women participating in a community skills workshop",
    resources: [
      { href: "/about", label: "About LAF's community programs" },
      { href: "https://www.unwomen.org/en", label: "UN Women" },
      { href: "/donate", label: "Support women's programs" },
    ],
  },
  "medical-checkups": {
    label: "Health & Medical Camps",
    imageAlt: "Free health checkup camp for children and families",
    resources: [
      { href: "/gallery", label: "Photos from LAF health programs" },
      { href: "https://nhm.gov.in/", label: "National Health Mission India" },
      { href: "/contact", label: "Partner on a health camp" },
    ],
  },
  "food-donation": {
    label: "Food & Nutrition",
    imageAlt: "Community food distribution for children and families",
    resources: [
      { href: "/donate", label: "Donate to support meals" },
      { href: "https://www.akshayapatra.org/", label: "Akshaya Patra (school meals)" },
      { href: "https://www.fao.org/india/en", label: "FAO India" },
    ],
  },
  volunteering: {
    label: "Volunteering",
    imageAlt: "Volunteers supporting children in a community program",
    resources: [
      { href: "/volunteer", label: "Become an LAF volunteer" },
      { href: "/library/volunteer-training", label: "Volunteer training resources" },
      { href: "/ways-to-help", label: "Ways to help LAF" },
    ],
  },
  community: {
    label: "Community Development",
    imageAlt: "Village community gathering for a social initiative",
    resources: [
      { href: "/csr", label: "CSR partnerships with LAF" },
      { href: "/events", label: "LAF events and competitions" },
      { href: "/blog", label: "More impact stories" },
    ],
  },
};

export const ARTICLE_VARIANTS = {
  education: [
    {
      title: "Why After-School Learning Matters for Village Children in Wardha",
      intro:
        "After the school bell rings, many children in Wardha and nearby villages return home without textbooks, tutors, or quiet space to study. After-school learning fills that gap — and it is one of the most practical ways an NGO can support long-term education outcomes.",
      sections: [
        {
          heading: "The gap between school and home",
          paragraphs: [
            "Government schools do essential work, but large class sizes and limited resources mean children often need extra help with reading, maths, and homework. Without it, bright students can fall behind simply because no one at home can explain a lesson again.",
            "Community learning spaces — even a shaded veranda with donated books — give children a safe place to revise, ask questions, and build confidence. Programs like the {laf} <a href=\"/library\">learning library</a> connect families to free online tools such as <a href=\"/library/khan-academy\">Khan Academy</a>.",
          ],
        },
        {
          heading: "What effective support looks like",
          paragraphs: [
            "Strong after-school programs combine three things: a regular schedule, trained volunteers or teachers, and materials matched to the child's grade. Snacks or a simple meal can dramatically improve attendance when families worry about hunger.",
            "Tracking attendance and basic learning milestones — not expensive tests — helps NGOs adjust quickly. Small cohorts of 15–20 children per mentor often work better than one-off mega events.",
          ],
        },
        {
          heading: "How families and donors can help",
          paragraphs: [
            "Donors can sponsor notebooks, lamps for evening study, or internet access for a community centre. Volunteers can commit to one hour weekly for reading practice — consistency matters more than expertise.",
            "If you are in Wardha, visit our <a href=\"/contact\">contact page</a> to explore tutoring, book drives, or computer-centre support. Every sustained hour of learning compounds over a child's school years.",
          ],
        },
      ],
    },
    {
      title: "Building Reading Habits Early in Rural Maharashtra",
      intro:
        "Reading is the foundation for every other subject — yet many rural children meet storybooks only inside a textbook. NGOs that promote early reading often see improvements in confidence, language skills, and classroom participation within a single term.",
      sections: [
        {
          heading: "Why reading aloud changes outcomes",
          paragraphs: [
            "When volunteers read aloud in Marathi or Hindi — and gradually introduce English picture books — children associate books with warmth rather than exams. Parent evenings that model reading at home multiply the effect.",
            "Organizations including <a href=\"https://www.unicef.org/india/what-we-do/education\" rel=\"noopener noreferrer\" target=\"_blank\">UNICEF India</a> emphasize early childhood education as a multiplier for lifelong learning. Local NGOs can start with a shelf of 50 books and a weekly story hour.",
          ],
        },
        {
          heading: "Practical steps for community libraries",
          paragraphs: [
            "Rotate books weekly so children return excited for new stories. Label shelves by reading level. Pair older students as 'reading buddies' for younger ones — leadership grows on both sides.",
            "The {laf} <a href=\"/library\">resource library</a> lists trusted free sites for literacy and science. Combine physical books with curated digital content where smartphones exist but bookshops do not.",
          ],
        },
        {
          heading: "Partner with LAF",
          paragraphs: [
            "Book donation drives, volunteer storytellers, and small grants for library corners are ongoing needs across Wardha district. <a href=\"/donate\">Donations</a> and <a href=\"/volunteer\">volunteer time</a> both keep shelves full and sessions running.",
            "Explore related posts on our <a href=\"/blog\">blog</a> or learn about our mission on the <a href=\"/about\">about page</a>.",
          ],
        },
      ],
    },
    {
      title: "Computer Centres as Bridges to Better Education",
      intro:
        "Digital tools cannot replace caring teachers, but they can extend reach — especially where textbook shortages and teacher vacancies persist. Community computer centres open doors to typed assignments, online courses, and basic coding.",
      sections: [
        {
          heading: "Starting with basics",
          paragraphs: [
            "Typing, file management, safe internet use, and video lessons form a sensible first curriculum. Centres that open after school hours avoid conflicting with regular classes.",
            "Maintenance and electricity costs are real; CSR partners and <a href=\"/csr\">corporate sponsors</a> often fund hardware while NGOs manage trainers and child safeguarding policies.",
          ],
        },
        {
          heading: "Coding and creativity",
          paragraphs: [
            "Platforms like <a href=\"/library/scratch\">Scratch</a> let children build games and animations while learning logic. Robotics and maker clubs can follow once fundamentals are stable.",
            "Digital literacy also means teaching students to verify information online — a skill as important as any software menu.",
          ],
        },
        {
          heading: "Get involved",
          paragraphs: [
            "Donate refurbished laptops, sponsor broadband, or mentor weekly sessions. The {laf} team coordinates centres across Wardha — reach us via <a href=\"/contact\">contact</a>.",
          ],
        },
      ],
    },
  ],
  career: [
    {
      title: "Career Guidance for First-Generation Learners in Wardha",
      intro:
        "When no one in the family has attended college, choosing a stream after Class 10 feels overwhelming. Structured career guidance — even short workshops — helps students see realistic paths in trades, nursing, teaching, IT, and entrepreneurship.",
      sections: [
        {
          heading: "Why mentors matter",
          paragraphs: [
            "A two-hour panel with local nurses, electricians, teachers, and small-business owners can demystify more than months of generic advice. Students ask practical questions about fees, exams, and daily work.",
            "Volunteer mentors need not be famous — they need to be honest about how they started. Sign up through our <a href=\"/volunteer\">volunteer page</a>.",
          ],
        },
        {
          heading: "Scholarships and skill courses",
          paragraphs: [
            "Many students miss deadlines simply because nobody told them. Maintain a calendar of state and national scholarships; the {laf} <a href=\"/library/scholarships\">scholarship library</a> lists starting points.",
            "Short skill courses through ITIs or <a href=\"https://www.nsdcindia.org/\" rel=\"noopener noreferrer\" target=\"_blank\">NSDC</a> partners can lead to employment within months — often overlooked compared with long degree routes.",
          ],
        },
        {
          heading: "Support the pipeline",
          paragraphs: [
            "Fund transport to career fairs, print exam forms, or sponsor aptitude tests. <a href=\"/donate\">Donate</a> or share your professional story — first-generation learners benefit enormously from visible role models.",
          ],
        },
      ],
    },
    {
      title: "Helping Rural Youth Plan Life After Class 12",
      intro:
        "The year after Class 12 is pivotal. Without counselling, capable students sometimes drop out from fear of costs or confusion — not lack of ability.",
      sections: [
        {
          heading: "Map options early",
          paragraphs: [
            "Create simple decision trees: degree vs diploma vs apprenticeship vs local employment. Include fee ranges and entrance exams so families can plan.",
            "Invite alumni from the same village who succeeded in varied fields — relatability builds belief.",
          ],
        },
        {
          heading: "Soft skills count",
          paragraphs: [
            "Interview practice, email writing, and time management workshops prepare students for campus and workplace alike. These sessions fit well in summer camps before results arrive.",
          ],
        },
        {
          heading: "Work with LAF",
          paragraphs: [
            "Partner on career camps in Wardha via <a href=\"/contact\">contact</a>. Browse free learning tools at <a href=\"/library\">library</a> and read more on the <a href=\"/blog\">blog</a>.",
          ],
        },
      ],
    },
  ],
  "digital-literacy": [
    {
      title: "Teaching Safe Internet Use in Community Learning Centres",
      intro:
        "Smartphones arrived in villages before formal digital education. NGOs must help children and parents navigate online safety, privacy, and credible information — not just app usage.",
      sections: [
        {
          heading: "Start with safety basics",
          paragraphs: [
            "Cover password hygiene, recognizing scams, respectful communication, and when to ask an adult for help. Role-play common phishing messages — students remember stories.",
            "Link families to the {laf} <a href=\"/library\">learning library</a> for vetted educational sites instead of random search results.",
          ],
        },
        {
          heading: "Productive screen time",
          paragraphs: [
            "Balance entertainment with creation: typing practice, video lessons, coding in <a href=\"/library/scratch\">Scratch</a>, or documenting local history projects.",
            "India's <a href=\"https://digitalindia.gov.in/\" rel=\"noopener noreferrer\" target=\"_blank\">Digital India</a> vision aligns with grassroots centres that teach practical skills, not jargon.",
          ],
        },
        {
          heading: "Volunteer trainers welcome",
          paragraphs: [
            "IT professionals can volunteer remote or in-person modules. <a href=\"/volunteer\">Join us</a> or <a href=\"/donate\">fund devices and connectivity</a> for Wardha centres.",
          ],
        },
      ],
    },
    {
      title: "Free Online Learning Tools Every Village Student Should Know",
      intro:
        "Quality education resources exist online at no cost — but discovery is uneven. Curated lists save teachers hours and give students a head start.",
      sections: [
        {
          heading: "Curated starting points",
          paragraphs: [
            "Maths and science: Khan Academy. Coding: Scratch and Code.org (see our <a href=\"/library\">library</a>). Languages: graded readers and subtitled videos with discussion guides.",
          ],
        },
        {
          heading: "Offline-first strategies",
          paragraphs: [
            "Download lessons where bandwidth is limited. Rotate SD cards among students. Print key exercises weekly for homes without devices.",
          ],
        },
        {
          heading: "Suggest a resource",
          paragraphs: [
            "Help grow India's free directory — <a href=\"/library/submit\">submit a site</a> you trust. Support {laf} through <a href=\"/donate\">donations</a>.",
          ],
        },
      ],
    },
  ],
  "women-empowerment": [
    {
      title: "Skills Training That Helps Women Earn with Dignity",
      intro:
        "Women's empowerment in rural India is practical: literacy, livelihood skills, access to credit, and voice in community decisions. NGOs succeed when programs respect local context while expanding real options.",
      sections: [
        {
          heading: "Livelihoods that fit local markets",
          paragraphs: [
            "Tailoring, food processing, beauty services, computer data entry, and agri-allied work can align with village demand. Training without market linkages fades — partner with self-help groups and buyers early.",
            "<a href=\"https://www.unwomen.org/en\" rel=\"noopener noreferrer\" target=\"_blank\">UN Women</a> highlights economic participation as core to gender equality; local NGOs translate that into weekly classes and mentorship.",
          ],
        },
        {
          heading: "Childcare and timing",
          paragraphs: [
            "Sessions scheduled during school hours or with childcare support see higher completion. Empowerment programs fail when attendance conflicts with fetching water or cooking.",
          ],
        },
        {
          heading: "Support LAF programs",
          paragraphs: [
            "Sponsor kits, micro-grants, or mentor visits in Wardha. <a href=\"/donate\">Donate</a>, <a href=\"/volunteer\">volunteer</a>, or discuss CSR via <a href=\"/csr\">CSR page</a>.",
          ],
        },
      ],
    },
    {
      title: "Literacy Circles for Mothers and Adult Women",
      intro:
        "When mothers learn to read, household health and education decisions often improve. Adult literacy circles create peer support without the stigma of returning to primary school benches.",
      sections: [
        {
          heading: "Design for dignity",
          paragraphs: [
            "Small groups, relevant materials (forms, medicine labels, phone menus), and female facilitators build trust quickly.",
          ],
        },
        {
          heading: "Link literacy to action",
          paragraphs: [
            "Combine reading practice with nutrition tips, bank account opening, or voting awareness — skills feel immediately useful.",
          ],
        },
        {
          heading: "Partner with us",
          paragraphs: [
            "Fund materials or volunteer as a facilitator. Contact {laf} in Wardha: <a href=\"/contact\">contact page</a>.",
          ],
        },
      ],
    },
  ],
  "medical-checkups": [
    {
      title: "Why Regular Health Camps Matter in Underserved Communities",
      intro:
        "Preventive checkups catch issues early — dental decay, anemia, refractive errors, hypertension — before they become crises. Mobile camps bring specialists to people who cannot afford travel to cities.",
      sections: [
        {
          heading: "Common camp services",
          paragraphs: [
            "Dental screening, eye tests, BMI and anemia checks, basic wound care, and referrals for follow-up. Document findings so returning camps measure progress.",
            "The <a href=\"https://nhm.gov.in/\" rel=\"noopener noreferrer\" target=\"_blank\">National Health Mission</a> supports primary care expansion; NGOs fill outreach gaps in villages.",
          ],
        },
        {
          heading: "Stories from the field",
          paragraphs: [
            "At Sewashram Wardha, LAF has organized dental and eye camps serving children and elders — sometimes a child's first proper exam. See photos in our <a href=\"/gallery\">gallery</a> and related blog posts.",
          ],
        },
        {
          heading: "Sponsor a camp",
          paragraphs: [
            "Clinics, labs, and donors can partner on equipment and medicines. Reach <a href=\"/contact\">contact</a> or <a href=\"/donate\">donate</a> to support health programs.",
          ],
        },
      ],
    },
    {
      title: "Eye and Dental Care: Small Checks, Big Life Changes",
      intro:
        "Uncorrected vision blocks learning; untreated dental pain distracts from class and nutrition. Simple camps remove barriers that last for years when left unaddressed.",
      sections: [
        {
          heading: "School-age priorities",
          paragraphs: [
            "Vision screening before exams, fluoride treatments, and hygiene kits prevent absenteeism. Refer complex cases to district hospitals with written records for parents.",
          ],
        },
        {
          heading: "Follow-up is essential",
          paragraphs: [
            "One camp without glasses delivery or dental referral lists helps less. Budget for second visits and transport subsidies when needed.",
          ],
        },
        {
          heading: "Join LAF health initiatives",
          paragraphs: [
            "Medical volunteers and sponsors welcome — <a href=\"/volunteer\">volunteer</a> or <a href=\"/contact\">contact us</a> in Wardha.",
          ],
        },
      ],
    },
  ],
  "food-donation": [
    {
      title: "Community Food Drives That Respect Dignity and Nutrition",
      intro:
        "Food donation is not only about quantity — balanced meals, hygienic handling, and respectful distribution protect dignity. NGOs in Wardha coordinate drives with schools, anganwadis, and self-help groups.",
      sections: [
        {
          heading: "Plan beyond one day",
          paragraphs: [
            "Single mega-drives help emergencies; monthly staples support stability. Coordinate rice, dal, oil, and seasonal vegetables with local dietary habits.",
            "Learn from organizations like <a href=\"https://www.akshayapatra.org/\" rel=\"noopener noreferrer\" target=\"_blank\">Akshaya Patra</a> on safe kitchen practices, scaled to community level.",
          ],
        },
        {
          heading: "Volunteer roles",
          paragraphs: [
            "Collection, sorting, packing, delivery, and documentation each need leads. Children should not carry unsafe loads — assign age-appropriate tasks.",
          ],
        },
        {
          heading: "Support through LAF",
          paragraphs: [
            "<a href=\"/donate\">Donate</a> for meals, sponsor drives, or join logistics as a <a href=\"/volunteer\">volunteer</a>. Read our <a href=\"/about\">mission</a>.",
          ],
        },
      ],
    },
    {
      title: "Nutrition Education Alongside Meal Programs",
      intro:
        "When families understand balanced plates and clean water, meal programs stretch further. Short demos on pulses, greens, and handwashing stick when paired with tasting sessions.",
      sections: [
        {
          heading: "Pair food with learning",
          paragraphs: [
            "Anganwadi workers and NGO volunteers can use simple charts in Marathi/Hindi. Track height and weight quarterly where possible.",
            "<a href=\"https://www.fao.org/india/en\" rel=\"noopener noreferrer\" target=\"_blank\">FAO India</a> publishes nutrition guidance adaptable for village workshops.",
          ],
        },
        {
          heading: "Reduce waste",
          paragraphs: [
            "Portion planning, proper storage, and composting teach sustainability alongside generosity.",
          ],
        },
        {
          heading: "Help feed futures",
          paragraphs: [
            "Fund nutrition kits or cooking demos via <a href=\"/donate\">donate</a>. Share this post: {url}",
          ],
        },
      ],
    },
    {
      title: "Organizing Village Food Collections That Actually Last",
      intro:
        "One-day drives grab attention; steady collections prevent hunger from returning next month. Wardha communities benefit when NGOs coordinate with fair pricing, local grocers, and school calendars.",
      sections: [
        {
          heading: "Inventory and storage",
          paragraphs: [
            "Track staples in simple registers — date, donor, quantity, expiry. Cool, dry storage prevents spoilage before families receive goods.",
          ],
        },
        {
          heading: "Work with anganwadis",
          paragraphs: [
            "Integrated child development centres already serve vulnerable children; partner rather than duplicate routes.",
          ],
        },
        {
          heading: "Donate or volunteer",
          paragraphs: [
            "<a href=\"/donate\">Support meal programs</a> or join distribution teams via <a href=\"/volunteer\">volunteer</a>.",
          ],
        },
      ],
    },
    {
      title: "School Meal Support During Exam Season",
      intro:
        "Exam periods stress household budgets — extra snacks, travel to centres, and lost wage time. Targeted meal support keeps students focused and reduces dropout pressure.",
      sections: [
        {
          heading: "Simple menus",
          paragraphs: [
            "Khichdi, peanuts, bananas, and eggs (where appropriate) are cost-effective and familiar. Avoid unfamiliar packaged foods children won't eat.",
          ],
        },
        {
          heading: "Measure attendance",
          paragraphs: [
            "Compare pre- and post-program school attendance where possible — meals should show up in data, not only photos.",
          ],
        },
        {
          heading: "Fund a week of meals",
          paragraphs: [
            "<a href=\"/donate\">Donate</a> or partner through <a href=\"/csr\">CSR</a>. Read more on <a href=\"/blog\">blog</a>.",
          ],
        },
      ],
    },
    {
      title: "Fighting Hidden Hunger with Micronutrients",
      intro:
        "Empty calories fill stomachs but not growth charts. NGOs address hidden hunger through iron, vitamin A, and iodine awareness alongside staples.",
      sections: [
        {
          heading: "Spot anemia early",
          paragraphs: [
            "Pale palms, fatigue, and poor concentration may signal anemia — common and treatable when screened in camps.",
          ],
        },
        {
          heading: "Garden patches",
          paragraphs: [
            "School gardens teach science while producing greens — low-cost nutrition education with harvest celebrations.",
          ],
        },
        {
          heading: "Support nutrition work",
          paragraphs: [
            "Contact <a href=\"/contact\">LAF in Wardha</a> or <a href=\"/donate\">donate</a> for supplements and screening kits.",
          ],
        },
      ],
    },
    {
      title: "How Online Giving Helps Fight Child Hunger in India",
      intro:
        "Digital donations connect diaspora supporters and urban donors to verified village programs within minutes — when transparency and local partners are clear.",
      sections: [
        {
          heading: "Trust and receipts",
          paragraphs: [
            "Publish 80G information, show photos with consent, and explain exactly what each amount buys — meals, bags, or transport.",
          ],
        },
        {
          heading: "Combine with volunteering",
          paragraphs: [
            "Donors who visit once often become long-term mentors. Link giving pages to <a href=\"/volunteer\">volunteer sign-up</a>.",
          ],
        },
        {
          heading: "Give securely",
          paragraphs: [
            "<a href=\"/donate\">Donate to LAF</a> and share {url} with friends.",
          ],
        },
      ],
    },
    {
      title: "Youth-Led Food Drives: Lessons from Wardha",
      intro:
        "Students and young professionals often energize collections with social media and creative themes — when adults provide safety, storage, and transport.",
      sections: [
        {
          heading: "Assign clear roles",
          paragraphs: [
            "Leads for outreach, finance, packing, and communication prevent burnout on one volunteer.",
          ],
        },
        {
          heading: "Celebrate without waste",
          paragraphs: [
            "Thank donors publicly but avoid competitive shaming — dignity drives repeat giving.",
          ],
        },
        {
          heading: "Join the next drive",
          paragraphs: [
            "See <a href=\"/events\">events</a> or email via <a href=\"/contact\">contact</a>.",
          ],
        },
      ],
    },
    {
      title: "Clothing and Food Drives: Supporting Families Holistically",
      intro:
        "Families facing food insecurity often need seasonal clothing and school uniforms simultaneously — bundled drives reduce repeated queueing.",
      sections: [
        {
          heading: "Sort with care",
          paragraphs: [
            "Clean, mended items only; size labels save dignity at distribution.",
          ],
        },
        {
          heading: "Pair with counselling",
          paragraphs: [
            "Brief chats on nutrition and hygiene multiply the value of material aid.",
          ],
        },
        {
          heading: "Organize with LAF",
          paragraphs: [
            "<a href=\"/ways-to-help\">Ways to help</a> · <a href=\"/donate\">Donate</a>",
          ],
        },
      ],
    },
  ],
  volunteering: [
    {
      title: "How Volunteers Multiply NGO Impact in Wardha",
      intro:
        "Professional staff anchor programs, but volunteers supply scale — tutoring, event logistics, translation, social media, and mentorship. One committed volunteer weekly can shift a child's trajectory.",
      sections: [
        {
          heading: "Roles for every skill",
          paragraphs: [
            "Teachers, accountants, designers, doctors, and students all fit. Remote volunteers can build lesson plans or review grant drafts.",
            "Browse <a href=\"/library/volunteer-training\">volunteer training resources</a> before your first session.",
          ],
        },
        {
          heading: "Safeguarding and consistency",
          paragraphs: [
            "Background checks for child-facing roles, attendance expectations, and handover notes when volunteers travel keep programs safe and stable.",
          ],
        },
        {
          heading: "Sign up today",
          paragraphs: [
            "<a href=\"/volunteer\">Become a volunteer</a> or explore <a href=\"/ways-to-help\">ways to help</a>.",
          ],
        },
      ],
    },
  ],
  community: [
    {
      title: "CSR Partnerships That Reach Village Classrooms",
      intro:
        "Corporate social responsibility works best with multi-year commitments, clear metrics, and local NGO partners who understand Wardha's communities.",
      sections: [
        {
          heading: "High-impact funding areas",
          paragraphs: [
            "Computer labs, meal programs, health camps, and girls' scholarships deliver visible outcomes. Employee volunteer days build culture beyond cheques.",
          ],
        },
        {
          heading: "Reporting with integrity",
          paragraphs: [
            "Photos with consent, attendance logs, and beneficiary feedback strengthen trust. {laf} welcomes transparent CSR collaborations via <a href=\"/csr\">CSR page</a>.",
          ],
        },
        {
          heading: "Start a conversation",
          paragraphs: [
            "Email through <a href=\"/contact\">contact</a>. See impact stories on <a href=\"/blog\">blog</a> and <a href=\"/gallery\">gallery</a>.",
          ],
        },
      ],
    },
    {
      title: "Events That Bring Communities Together for a Cause",
      intro:
        "Drawing competitions, sports days, and festival fundraisers create joy while raising awareness for education and nutrition programs.",
      sections: [
        {
          heading: "Youth participation",
          paragraphs: [
            "Creative events like the <a href=\"/events/drawing-competition\">LAF Drawing Competition</a> celebrate talent and connect families to the foundation's work.",
          ],
        },
        {
          heading: "Local partnerships",
          paragraphs: [
            "Schools, clubs, and merchants co-host events — sharing costs and crowds.",
          ],
        },
        {
          heading: "Join the next event",
          paragraphs: [
            "Visit <a href=\"/events\">events</a> or <a href=\"/volunteer\">volunteer</a> to help organize.",
          ],
        },
      ],
    },
  ],
};

/** Slug-specific overrides — real LAF field stories kept factual. */
export const PRESERVE_SLUGS = new Set([
  "more-than-a-checkup-restoring-smiles-and-confidence",
  "free-eye-checkup-at-sewashram",
]);

export function pickTopic(index, slug) {
  if (/food|hunger|meal|kitchen|curry|nutrition|nourish/i.test(slug)) return "food-donation";
  if (/computer|laptop|digital|scratch|robotics/i.test(slug)) return "digital-literacy";
  if (/book|education|school|learn|mentor|youth|volunteer-opportunit/i.test(slug)) return "education";
  if (/career|job|skill/i.test(slug)) return "career";
  if (/women|girl|mother/i.test(slug)) return "women-empowerment";
  if (/health|medical|checkup|eye|dental|sewashram/i.test(slug)) return "medical-checkups";
  if (/volunteer|helping-hands|mentoring/i.test(slug)) return "volunteering";
  if (/csr|300-lives|impact|foundation|empowering-change/i.test(slug)) return "community";
  if (/cloth|donate-comput/i.test(slug)) return "community";
  return TOPICS[index % TOPICS.length];
}
