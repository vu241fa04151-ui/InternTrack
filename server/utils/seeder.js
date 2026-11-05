require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const SavedInternship = require('../models/SavedInternship');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');

const sampleInternships = [
  {
    title: 'Software Engineering Intern (Summer 2026)',
    company: 'Google',
    companyLogo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
    description:
      'Join Google engineering teams to build products that impact billions of users worldwide. Work on core distributed systems, scalable web applications, machine learning workflows, and cloud infrastructure.',
    requiredSkills: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'Distributed Systems'],
    location: 'Mountain View, CA (Hybrid)',
    workMode: 'Hybrid',
    duration: '12 Weeks',
    stipend: '$8,500/month',
    stipendAmount: 8500,
    eligibility: 'Pursuing Bachelor’s or Master’s in Computer Science, Software Engineering or related STEM field. Graduating between Dec 2026 and June 2027.',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    applyUrl: 'https://careers.google.com/students',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Frontend Developer Intern',
    company: 'Stripe',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    description:
      'Craft delightful payment interfaces, developer dashboards, and checkout experiences. Collaborate closely with designers and product managers using React, TypeScript, and modern design systems.',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML5', 'REST APIs', 'UI/UX Design'],
    location: 'San Francisco, CA / Remote',
    workMode: 'Remote',
    duration: '14 Weeks',
    stipend: '$9,000/month',
    stipendAmount: 9000,
    eligibility: 'Undergraduate student with demonstrable portfolio projects in web development and React.',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    applyUrl: 'https://stripe.com/jobs/students',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Cloud & DevOps Engineering Intern',
    company: 'Microsoft',
    companyLogo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
    description:
      'Help power Microsoft Azure infrastructure. You will write automation scripts, build CI/CD pipelines, optimize containerized workloads with Kubernetes, and monitor distributed telemetry.',
    requiredSkills: ['Azure', 'Docker', 'Kubernetes', 'Python', 'Go', 'Linux', 'Terraform'],
    location: 'Redmond, WA (On-site)',
    workMode: 'On-site',
    duration: '12 Weeks',
    stipend: '$8,200/month',
    stipendAmount: 8200,
    eligibility: 'Computer Science, Electrical Engineering, or IT students with solid understanding of operating systems and cloud concepts.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Approaching deadline (5 days!)
    applyUrl: 'https://careers.microsoft.com/students/us/en',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Machine Learning Research Intern',
    company: 'Meta',
    companyLogo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg',
    description:
      'Collaborate with Meta AI (FAIR) researchers on cutting-edge generative AI, computer vision, and foundation model alignment. Implement novel architectures and publish scientific findings.',
    requiredSkills: ['PyTorch', 'Python', 'Deep Learning', 'Linear Algebra', 'NLP', 'CUDA'],
    location: 'Menlo Park, CA (Hybrid)',
    workMode: 'Hybrid',
    duration: '16 Weeks',
    stipend: '$10,200/month',
    stipendAmount: 10200,
    eligibility: 'Enrolled in an MS or PhD program in AI/CS with prior machine learning research publication or significant portfolio work.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://www.metacareers.com/students',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Full Stack Web Developer Intern',
    company: 'Notion',
    companyLogo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop',
    description:
      'Help make Notion faster, more collaborative, and flexible. Work across our React/Next.js frontend, Node.js backend services, and PostgreSQL databases to build seamless workspace features.',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'],
    location: 'New York, NY (Remote)',
    workMode: 'Remote',
    duration: '12 Weeks',
    stipend: '$7,800/month',
    stipendAmount: 7800,
    eligibility: 'Graduating 2026 or 2027. Experience building and deploying full-stack web applications.',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    applyUrl: 'https://www.notion.so/careers',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Product Design (UI/UX) Intern',
    company: 'Airbnb',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
    description:
      'Design next-generation guest and host experiences. Conduct user research, produce high-fidelity interactive Figma prototypes, and partner with engineers to deliver intuitive flows.',
    requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'HTML/CSS basics'],
    location: 'San Francisco, CA (Hybrid)',
    workMode: 'Hybrid',
    duration: '12 Weeks',
    stipend: '$7,500/month',
    stipendAmount: 7500,
    eligibility: 'Pursuing a degree in Design, HCI, or related field with a strong portfolio showcasing user-centered product design.',
    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://careers.airbnb.com/university',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Data Science & Analytics Intern',
    company: 'Spotify',
    companyLogo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop',
    description:
      'Uncover user listening behaviors, conduct A/B testing on recommendation algorithms, and deliver data-driven insights that shape product strategy for millions of music fans.',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'Tableau', 'A/B Testing', 'Statistics'],
    location: 'Boston, MA (Hybrid)',
    workMode: 'Hybrid',
    duration: '10 Weeks',
    stipend: '$7,200/month',
    stipendAmount: 7200,
    eligibility: 'Students with strong proficiency in statistical modeling, SQL querying, and metric storytelling.',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://www.lifeatspotify.com/students',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Cybersecurity Analyst Intern',
    company: 'CrowdStrike',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop',
    description:
      'Work alongside our threat hunting and incident response teams. Analyze malware telemetry, evaluate security architectures, and develop automated detection scripts.',
    requiredSkills: ['Python', 'Network Security', 'Wireshark', 'Linux', 'Threat Modeling', 'SIEM'],
    location: 'Austin, TX / Remote',
    workMode: 'Remote',
    duration: '12 Weeks',
    stipend: '$7,000/month',
    stipendAmount: 7000,
    eligibility: 'Major in Cybersecurity, Information Assurance, or CS with keen curiosity about infosec defense.',
    deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://www.crowdstrike.com/careers/university-programs',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Mobile App Developer Intern (iOS/Android)',
    company: 'Uber',
    companyLogo: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=100&h=100&fit=crop',
    description:
      'Build native iOS and Android rider and driver features with high reliability and offline resilience. Collaborate with mobile platform engineers to optimize app startup and network efficiency.',
    requiredSkills: ['Swift', 'Kotlin', 'React Native', 'Mobile Architecture', 'Git', 'REST APIs'],
    location: 'Seattle, WA (On-site)',
    workMode: 'On-site',
    duration: '12 Weeks',
    stipend: '$8,000/month',
    stipendAmount: 8000,
    eligibility: 'Students with hands-on experience building iOS or Android applications available on TestFlight or GitHub.',
    deadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://www.uber.com/us/en/careers/university',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Backend Systems & API Intern',
    company: 'Datadog',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
    description:
      'Engineer high-throughput data intake pipelines ingesting trillions of metrics per day. Learn to write ultra-performant Go and Python services with Kafka and Redis.',
    requiredSkills: ['Go', 'Python', 'Kafka', 'Redis', 'Docker', 'Microservices', 'Distributed Systems'],
    location: 'New York, NY (Hybrid)',
    workMode: 'Hybrid',
    duration: '12 Weeks',
    stipend: '$8,400/month',
    stipendAmount: 8400,
    eligibility: 'Passionate about backend systems, concurrency, and real-time observability platforms.',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://careers.datadoghq.com/students',
    isVerified: true,
    isSample: false,
  },
  {
    title: 'Campus Ambassador & Marketing Intern (Sample Demo)',
    company: 'FinTech Startup Hub (Sample)',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
    description:
      'Demo sample opportunity for students interested in early-stage product marketing, campus outreach, student tech community management, and brand storytelling.',
    requiredSkills: ['Social Media', 'Content Creation', 'Event Planning', 'Public Speaking'],
    location: 'Chicago, IL (Hybrid)',
    workMode: 'Hybrid',
    duration: '8 Weeks',
    stipend: '$2,000/month',
    stipendAmount: 2000,
    eligibility: 'Active university club leader or student influencer with strong communication skills.',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://example.com/sample-apply',
    isVerified: false,
    isSample: true, // Marked clearly as sample demo
  },
  {
    title: 'Junior QA & Automation Tester (Sample Demo)',
    company: 'Acme Test Labs (Sample)',
    companyLogo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop',
    description:
      'Demo sample opportunity to practice writing end-to-end Cypress test suites, creating automated regression test plans, and reporting software bugs.',
    requiredSkills: ['Cypress', 'JavaScript', 'Selenium', 'Test Planning', 'Postman'],
    location: 'Remote',
    workMode: 'Remote',
    duration: '6 Weeks',
    stipend: '$1,800/month',
    stipendAmount: 1800,
    eligibility: 'Beginners looking to gain practical experience in QA engineering and automated software testing.',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://example.com/sample-qa',
    isVerified: false,
    isSample: true, // Marked clearly as sample demo
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to MongoDB. Clearing existing collections...');

    await User.deleteMany();
    await Internship.deleteMany();
    await Application.deleteMany();
    await SavedInternship.deleteMany();
    await Interview.deleteMany();
    await Notification.deleteMany();

    console.log('[Seeder] Creating sample internships...');
    const createdInternships = await Internship.insertMany(sampleInternships);
    console.log(`[Seeder] Created ${createdInternships.length} internships.`);

    console.log('[Seeder] Creating demo student account...');
    const demoStudent = await User.create({
      name: 'Alex Morgan',
      email: 'alex.morgan@stanford.edu',
      password: 'Password123!',
      college: 'Stanford University',
      degree: 'B.S.',
      branch: 'Computer Science',
      graduationYear: 2026,
      skills: ['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'Docker', 'Tailwind CSS'],
      bio: 'Junior CS student passionate about building scalable web applications and distributed systems. Seeking Summer 2026 SWE internships.',
      githubUrl: 'https://github.com/alexmorgan-dev',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      portfolioUrl: 'https://alexmorgan.dev',
      role: 'student',
    });
    console.log(`[Seeder] Created demo student: ${demoStudent.email} / Password123!`);

    console.log('[Seeder] Creating sample applications across various stages...');
    const appsToCreate = [
      {
        user: demoStudent._id,
        internship: createdInternships[0]._id, // Google
        title: 'Software Engineering Intern (Summer 2026)',
        company: 'Google',
        applicationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        applicationLink: 'https://careers.google.com/students',
        location: 'Mountain View, CA (Hybrid)',
        stipend: '$8,500/month',
        deadline: createdInternships[0].deadline,
        status: 'Interview',
        notes: 'Passed the Online Technical Assessment on HackerRank! Scheduling Round 1 Data Structures interview.',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Interview', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Invited to Technical Round 1' },
          { status: 'Assessment', changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: 'Completed 90-minute OA' },
          { status: 'Applied', changedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), note: 'Submitted via student portal' },
        ],
      },
      {
        user: demoStudent._id,
        internship: createdInternships[1]._id, // Stripe
        title: 'Frontend Developer Intern',
        company: 'Stripe',
        applicationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        applicationLink: 'https://stripe.com/jobs/students',
        location: 'San Francisco, CA / Remote',
        stipend: '$9,000/month',
        deadline: createdInternships[1].deadline,
        status: 'Selected',
        notes: 'Official Offer letter received! 14-week summer term with relocation stipend included.',
        nextFollowUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Selected', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Received offer letter via DocuSign' },
          { status: 'Interview', changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), note: 'Completed final design/system pairing' },
          { status: 'Shortlisted', changedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), note: 'Recruiter phone screen passed' },
          { status: 'Applied', changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), note: 'Application submitted with portfolio' },
        ],
      },
      {
        user: demoStudent._id,
        internship: createdInternships[2]._id, // Microsoft
        title: 'Cloud & DevOps Engineering Intern',
        company: 'Microsoft',
        applicationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        applicationLink: 'https://careers.microsoft.com/students/us/en',
        location: 'Redmond, WA (On-site)',
        stipend: '$8,200/month',
        deadline: createdInternships[2].deadline,
        status: 'Assessment',
        notes: 'Received Codility assessment link. Must finish 3 algorithms questions by Friday.',
        nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Assessment', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Received Codility OA invite' },
          { status: 'Applied', changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), note: 'Applied via University careers day link' },
        ],
      },
      {
        user: demoStudent._id,
        internship: createdInternships[4]._id, // Notion
        title: 'Full Stack Web Developer Intern',
        company: 'Notion',
        applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        applicationLink: 'https://www.notion.so/careers',
        location: 'New York, NY (Remote)',
        stipend: '$7,800/month',
        deadline: createdInternships[4].deadline,
        status: 'Shortlisted',
        notes: 'Recruiter reached out on LinkedIn asking for portfolio code repositories.',
        nextFollowUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Shortlisted', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Shortlisted for technical screen' },
          { status: 'Applied', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Applied on company careers portal' },
        ],
      },
      {
        user: demoStudent._id,
        internship: null,
        title: 'Backend Software Intern',
        company: 'Amazon Web Services',
        applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        applicationLink: 'https://amazon.jobs',
        location: 'Seattle, WA',
        stipend: '$8,600/month',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'Rejected',
        notes: 'Position closed due to high applicant volume. Feedback recommended strengthening concurrency concepts.',
        nextFollowUpDate: null,
        statusHistory: [
          { status: 'Rejected', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Rejection email received' },
          { status: 'Assessment', changedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), note: 'Completed Amazon OA1 and OA2' },
          { status: 'Applied', changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), note: 'Applied online' },
        ],
      },
      {
        user: demoStudent._id,
        internship: createdInternships[6]._id, // Spotify
        title: 'Data Science & Analytics Intern',
        company: 'Spotify',
        applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        applicationLink: 'https://www.lifeatspotify.com/students',
        location: 'Boston, MA (Hybrid)',
        stipend: '$7,200/month',
        deadline: createdInternships[6].deadline,
        status: 'Applied',
        notes: 'Sent cover letter detailing recommendation system projects.',
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Application submitted' },
        ],
      },
      {
        user: demoStudent._id,
        internship: createdInternships[9]._id, // Datadog
        title: 'Backend Systems & API Intern',
        company: 'Datadog',
        applicationDate: new Date(),
        applicationLink: 'https://careers.datadoghq.com/students',
        location: 'New York, NY (Hybrid)',
        stipend: '$8,400/month',
        deadline: createdInternships[9].deadline,
        status: 'Interested',
        notes: 'Need to tailor resume to emphasize Go concurrency and Kafka prior to applying.',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Interested', changedAt: new Date(), note: 'Saved to Interested column on Kanban' },
        ],
      },
    ];

    const createdApps = await Application.insertMany(appsToCreate);
    console.log(`[Seeder] Created ${createdApps.length} applications.`);

    console.log('[Seeder] Creating sample interviews...');
    await Interview.create([
      {
        user: demoStudent._id,
        application: createdApps[0]._id, // Google
        company: 'Google',
        role: 'Software Engineering Intern',
        interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        interviewTime: '14:00',
        interviewMode: 'Google Meet',
        interviewRound: 'Technical Round 1',
        meetingLink: 'https://meet.google.com/abc-wxyz-demo',
        location: 'Online',
        preparationNotes: 'Review graph traversal (BFS/DFS), dynamic programming, and practice on Google Docs without syntax highlighting.',
        status: 'Scheduled',
      },
      {
        user: demoStudent._id,
        application: createdApps[1]._id, // Stripe
        company: 'Stripe',
        role: 'Frontend Developer Intern',
        interviewDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        interviewTime: '11:00',
        interviewMode: 'Zoom',
        interviewRound: 'Technical Round 2',
        meetingLink: 'https://zoom.us/j/1234567890',
        location: 'Online',
        preparationNotes: 'Live coding session building a real-time reactive payment form component with debounce and accessibility.',
        status: 'Completed',
      },
    ]);

    console.log('[Seeder] Creating sample saved internships...');
    await SavedInternship.create([
      {
        user: demoStudent._id,
        internship: createdInternships[3]._id, // Meta
        notes: 'Highly interested in PyTorch research internship; need to finish reading LLaMA paper.',
      },
      {
        user: demoStudent._id,
        internship: createdInternships[7]._id, // CrowdStrike
        notes: 'Recommended by professor; review packet for cybersecurity defense.',
      },
    ]);

    console.log('[Seeder] Creating sample in-app notifications...');
    await Notification.create([
      {
        user: demoStudent._id,
        title: 'Upcoming Interview: Google',
        message: 'Technical Round 1 interview with Google is scheduled in 3 days at 14:00 via Google Meet.',
        type: 'interview',
        isRead: false,
      },
      {
        user: demoStudent._id,
        title: 'Deadline Approaching: Microsoft',
        message: 'Cloud & DevOps Engineering Intern application closes in 5 days! Complete your submission.',
        type: 'deadline',
        isRead: false,
      },
      {
        user: demoStudent._id,
        title: 'Congratulations! Offer Received',
        message: 'Stripe marked your application as "Selected (Offer)"! Review the official offer details.',
        type: 'status_update',
        isRead: true,
      },
    ]);

    console.log('[Seeder] Database seeding completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Destroying all data...');
    await User.deleteMany();
    await Internship.deleteMany();
    await Application.deleteMany();
    await SavedInternship.deleteMany();
    await Interview.deleteMany();
    await Notification.deleteMany();
    console.log('[Seeder] All collections flushed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}

