import { PrebuiltSubject } from '../types';

export const prebuiltSubjects: PrebuiltSubject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    color: 'from-blue-500 to-indigo-600',
    description: 'Algebra, Trigonometry, Calculus, and Coordinate Geometry with step-by-step formula derivations.',
    chapters: [
      'Quadratic Equations & Complex Numbers',
      'Matrices and Determinants',
      'Trigonometric Identities & Equations',
      'Limits, Continuity & Differentiation',
      'Integrals and Differential Equations',
      'Probability & Statistics Foundations'
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Atom',
    color: 'from-violet-500 to-purple-600',
    description: 'Newtonian Mechanics, Thermodynamics, Electromagnetism, Optics, and Modern Quantum Theories.',
    chapters: [
      'Vectors, Kinematics & Laws of Motion',
      'Work, Energy, Power & Rotational Dynamics',
      'Thermodynamics & Kinetic Theory of Gases',
      'Electrostatics and Current Electricity',
      'Magnetic Effects of Current & AC Circuits',
      'Dual Nature of Matter & Nuclear Physics'
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'FlaskConical',
    color: 'from-emerald-500 to-teal-600',
    description: 'Stoichiometry, Organic Pathways, Electrochemistry, and Quantum Models of Atoms.',
    chapters: [
      'Some Basic Concepts & Chemical Arithmetic',
      'Structure of Atom & Periodic Properties',
      'Chemical Bonding & Molecular Orbitals',
      'Chemical Thermodynamics & Equilibrium',
      'Organic Chemistry: Hydrocarbons & Haloalkanes',
      'Coordination Compounds & Biomolecules'
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: 'Dna',
    color: 'from-rose-500 to-pink-600',
    description: 'Cell Division, Human Physiology, Genetics, Botany, Evolution, and Ecological Frameworks.',
    chapters: [
      'Cell: The Unit of Life & Biomolecules',
      'Plant Physiology & Photosynthesis',
      'Human Physiology: Digestion & Respiration',
      'Principles of Inheritance and Variation',
      'Molecular Basis of Inheritance',
      'Biotechnology: Principles and Applications'
    ]
  },
  {
    id: 'cs',
    name: 'Computer Science',
    icon: 'Cpu',
    color: 'from-amber-500 to-orange-600',
    description: 'Data Structures, Object-Oriented Principles, Database Systems, and Network Protocols.',
    chapters: [
      'Introduction to Python/C++ Programming',
      'Data Structures: Arrays, Lists & Trees',
      'Object Oriented Programming Principles',
      'Relational Database Management & SQL',
      'Computer Networks and Web Protocols',
      'Boolean Algebra & Digital Electronics'
    ]
  },
  {
    id: 'english',
    name: 'English Literature',
    icon: 'BookOpen',
    color: 'from-sky-500 to-cyan-600',
    description: 'Grammar mechanics, comprehension strategies, classic drama analysis, and essay writing.',
    chapters: [
      'Advanced Grammar & Sentence Structuring',
      'Reading Comprehension & Critical Analysis',
      'Creative Writing & Formal Essays',
      'Analysis of Shakespearian Drama',
      'Poetry Appreciation & Figures of Speech',
      'Modern Prose & Literary Criticism'
    ]
  }
];
