const scienceContent = {
  "questions": [
    {
      "id": "granite",
      "area": "Rock families",
      "prompt": "Three grains in a granite sample are quartz, feldspar and mica. What does the sample tell you?",
      "choices": [
        "A rock can contain several minerals.",
        "Each grain is a separate type of rock.",
        "A mineral must contain three rocks."
      ],
      "answer": 0,
      "hint": "Think about the whole sample and the smaller things it contains.",
      "why": "Quartz, feldspar and mica are minerals. Together they make up this granite, a rock."
    },
    {
      "id": "magma",
      "area": "Rock families",
      "prompt": "Melted rock cools and hardens below the ground. Which label belongs on the sample?",
      "choices": [
        "Extrusive igneous",
        "Intrusive igneous",
        "Sedimentary"
      ],
      "answer": 1,
      "hint": "Where was the melted rock when it became solid?",
      "why": "Magma that solidifies underground forms intrusive igneous rock. Lava that solidifies at the surface forms extrusive igneous rock."
    },
    {
      "id": "layers",
      "area": "Rock families",
      "prompt": "Three undisturbed sediment layers lie one above another. Which layer was deposited first?",
      "choices": [
        "The top layer",
        "The middle layer",
        "The bottom layer"
      ],
      "answer": 2,
      "hint": "Imagine putting down one sheet of paper each day. Where is the first sheet?",
      "why": "In an undisturbed stack, younger layers accumulate on older ones. The bottom layer was deposited first."
    },
    {
      "id": "contact",
      "area": "Rock families",
      "prompt": "A narrow strip of rock changes next to hot magma. It stays solid. What happened?",
      "choices": [
        "Contact metamorphism",
        "Regional metamorphism",
        "Cementation"
      ],
      "answer": 0,
      "hint": "Which process happens close to a hot body of magma?",
      "why": "Heat from nearby magma changes solid rock in contact metamorphism. Regional metamorphism affects a much larger area under heat and pressure."
    },
    {
      "id": "cement",
      "area": "Rock cycle",
      "prompt": "Buried sand grains are already pressed close together. What can bind them into sandstone?",
      "choices": [
        "Erosion carries them away.",
        "Cementation joins the grains.",
        "Melting makes magma."
      ],
      "answer": 1,
      "hint": "Think about the difference between pressing grains closer and sticking them together.",
      "why": "Compaction presses grains together. During cementation, minerals bind the grains into rock."
    },
    {
      "id": "solid",
      "area": "Rock cycle",
      "prompt": "Marble is forming from limestone deep underground. What happens to the limestone?",
      "choices": [
        "It melts and becomes magma.",
        "It breaks into loose grains.",
        "It changes under heat and pressure while solid."
      ],
      "answer": 2,
      "hint": "Would a rock still be solid after melting?",
      "why": "Heat and pressure change solid limestone into marble. If the rock melted, the result would be magma."
    },
    {
      "id": "lustre",
      "area": "Minerals",
      "prompt": "Pyrite looks metallic and quartz looks glassy. Which property are you comparing?",
      "choices": [
        "Lustre",
        "Hardness",
        "Magnetism"
      ],
      "answer": 0,
      "hint": "Look at how light bounces off the surfaces.",
      "why": "Lustre describes reflected light. Metallic and glassy are two ways a mineral can look."
    },
    {
      "id": "hardness",
      "area": "Minerals",
      "prompt": "Mineral A leaves a scratch on B. Which property did you test?",
      "choices": [
        "Fluorescence",
        "Hardness",
        "Colour"
      ],
      "answer": 1,
      "hint": "Which property measures how well a surface resists a scratch?",
      "why": "Hardness is resistance to scratching. On the Mohs scale, talc is 1 and diamond is 10."
    },
    {
      "id": "colour",
      "area": "Minerals",
      "prompt": "One piece of quartz is pink and another is clear. How can you investigate whether they are the same mineral?",
      "choices": [
        "Use colour as the only test.",
        "Measure the size of each piece.",
        "Compare properties such as hardness and lustre."
      ],
      "answer": 2,
      "hint": "Can one mineral occur in more than one colour?",
      "why": "Quartz can occur in different colours. Comparing several properties gives a better identification."
    },
    {
      "id": "roots",
      "area": "Changing landscapes",
      "prompt": "A root grows inside a crack. The rock splits and the pieces stay there. Which process did the root cause?",
      "choices": [
        "Biological weathering",
        "Erosion by water",
        "Deposition"
      ],
      "answer": 0,
      "hint": "Ask what the living root did before any pieces moved.",
      "why": "A living root broke the rock in place. That is biological weathering."
    },
    {
      "id": "ice",
      "area": "Changing landscapes",
      "prompt": "A glacier carries a loose rock down a valley. What is happening to the rock?",
      "choices": [
        "Chemical weathering",
        "Erosion by ice",
        "Deposition by wind"
      ],
      "answer": 1,
      "hint": "Focus on the journey of the loose rock.",
      "why": "Moving ice transports the rock. Water, wind and gravity can also move sediment."
    },
    {
      "id": "delta",
      "area": "Changing landscapes",
      "prompt": "At a river mouth the water slows and drops sand. Which process can build a delta there?",
      "choices": [
        "Melting",
        "Weathering",
        "Deposition"
      ],
      "answer": 2,
      "hint": "What happens to the sand when the river stops carrying it?",
      "why": "Sediment settles and accumulates at the river mouth. Repeated deposition can build a delta."
    }
  ],
  "routes": [
    {
      "id": "ig-sed",
      "start": "Igneous",
      "end": "Sedimentary",
      "challenge": "A grain starts in granite. How could it end up in sandstone?",
      "steps": [
        "Weathering breaks rock into sediment",
        "Erosion carries the sediment",
        "Deposition leaves layers of sediment",
        "Compaction and cementation form rock"
      ],
      "hint": "Follow one grain. How does it come loose, where does it go, and what binds it to other grains?",
      "cloze": "Weathering breaks the rock into [ ]. After transport and deposition, the grains are compacted and [ ] together.",
      "words": [
        "sediments",
        "cemented"
      ],
      "checks": [
        "I named the starting and finishing rock types.",
        "I explained how weathering makes sediments and erosion moves them.",
        "I explained how compaction and cementation turn the sediments into rock."
      ],
      "model": "Weathering breaks igneous rock into sediments. Erosion carries the pieces and they are deposited in layers. The layers are compacted and cemented together, forming sedimentary rock."
    },
    {
      "id": "ig-met",
      "start": "Igneous",
      "end": "Metamorphic",
      "challenge": "A piece of granite is buried deep underground. How could it become metamorphic rock?",
      "steps": [
        "Igneous rock is buried",
        "Heat and pressure act on solid rock",
        "The solid rock changes into metamorphic rock"
      ],
      "hint": "Think about whether the buried granite stays solid. What two things can change it?",
      "cloze": "Deep underground, heat and [ ] change igneous rock while it stays [ ].",
      "words": [
        "pressure",
        "solid"
      ],
      "checks": [
        "I started with igneous rock and finished with metamorphic rock.",
        "I described heat and pressure acting on the rock.",
        "I made it clear that the rock stays solid."
      ],
      "model": "Deep underground, heat and pressure change igneous rock while it stays solid. It becomes metamorphic rock. Granite can change into gneiss this way."
    },
    {
      "id": "sed-met",
      "start": "Sedimentary",
      "end": "Metamorphic",
      "challenge": "Limestone is buried. Explain how it could become marble.",
      "steps": [
        "Sedimentary rock is buried",
        "Heat and pressure change the solid rock",
        "Metamorphic rock forms"
      ],
      "hint": "Think of limestone changing underground. Would melting leave you with marble or with magma?",
      "cloze": "Buried limestone changes under [ ] and pressure. The new rock, marble, is [ ].",
      "words": [
        "heat",
        "metamorphic"
      ],
      "checks": [
        "I started with sedimentary rock and named the metamorphic result.",
        "I included both heat and pressure.",
        "I explained that the rock changes while solid."
      ],
      "model": "Limestone is sedimentary rock. Heat and pressure change it while it stays solid, forming marble, a metamorphic rock."
    },
    {
      "id": "sed-ig",
      "start": "Sedimentary",
      "end": "Igneous",
      "challenge": "Follow the route in your class notebook. How could sandstone become an igneous rock?",
      "steps": [
        "Heat and pressure form metamorphic rock",
        "Melting produces magma",
        "Cooling and solidifying form igneous rock"
      ],
      "hint": "On the route in your notebook, which solid rock appears before the magma? What happens after melting?",
      "cloze": "Heat and pressure first form [ ] rock. It melts into [ ], which cools and solidifies.",
      "words": [
        "metamorphic",
        "magma"
      ],
      "checks": [
        "I started with sedimentary rock and explained how heat and pressure form metamorphic rock.",
        "I said that the metamorphic rock melts into magma.",
        "I explained how cooling and solidifying produce igneous rock."
      ],
      "model": "First, heat and pressure change sedimentary rock into metamorphic rock. Then the metamorphic rock melts into magma. Finally, the magma cools and solidifies, forming igneous rock."
    },
    {
      "id": "met-ig",
      "start": "Metamorphic",
      "end": "Igneous",
      "challenge": "A piece of gneiss starts out solid. How can it become an igneous rock?",
      "steps": [
        "Metamorphic rock melts",
        "Magma forms",
        "Magma cools and solidifies as igneous rock"
      ],
      "hint": "What do we call molten rock underground? Which change makes it solid again?",
      "cloze": "Metamorphic rock [ ] into magma. As the magma [ ] and solidifies, igneous rock forms.",
      "words": [
        "melts",
        "cools"
      ],
      "checks": [
        "I named metamorphic rock as the starting material.",
        "I explained melting and named the magma it produces.",
        "I explained how magma cools and solidifies into igneous rock."
      ],
      "model": "Metamorphic rock melts into magma. When the magma cools and solidifies, it becomes igneous rock."
    },
    {
      "id": "met-sed",
      "start": "Metamorphic",
      "end": "Sedimentary",
      "challenge": "A grain breaks away from a piece of gneiss. How could it become part of a sedimentary rock?",
      "steps": [
        "Weathering breaks metamorphic rock into sediments",
        "Erosion moves the sediments",
        "Deposition builds layers",
        "Compaction and cementation form sedimentary rock"
      ],
      "hint": "What happens to the pieces at the surface? What happens after they are buried?",
      "cloze": "Weathering makes sediments and [ ] transports them. After deposition, compaction and [ ] form sedimentary rock.",
      "words": [
        "erosion",
        "cementation"
      ],
      "checks": [
        "I named the starting metamorphic rock and the final sedimentary rock.",
        "I explained weathering and erosion in order.",
        "I explained how compaction and cementation form the final rock."
      ],
      "model": "Weathering breaks metamorphic rock into sediments, and erosion moves them. After deposition, the sediments are compacted and cemented into sedimentary rock."
    }
  ],
  "guide": [
    {
      "name": "Rock families",
      "hook": "What is inside a rock?",
      "notes": [
        [
          "Geology",
          "Geologists study Earth, its materials, its history and the processes that change it. A rock is made of one or more minerals. In granite you can find quartz, feldspar and mica."
        ],
        [
          "Igneous",
          "Molten rock cools and solidifies. Granite and diorite form underground from magma (intrusive). Basalt and obsidian form from lava at the surface (extrusive)."
        ],
        [
          "Sedimentary",
          "Sediments can collect in layers. Compaction presses grains together. Cementation binds them. Sandstone and conglomerate form this way. Limestone is also a sedimentary rock. In undisturbed layers, the oldest is at the bottom."
        ],
        [
          "Metamorphic",
          "Heat and pressure can change a solid rock. In contact metamorphism, nearby magma supplies intense heat. Regional metamorphism affects a large area under heat and pressure. Slate, gneiss and marble are examples."
        ]
      ]
    },
    {
      "name": "Rock cycle",
      "hook": "Can a rock take more than one route?",
      "notes": [
        [
          "A cycle with many routes",
          "Any rock type can become another rock type through one or more processes. Name your starting rock, trace each change and say what forms at the end."
        ],
        [
          "At the surface",
          "Weathering breaks rock into sediment. Erosion carries it away. Deposition leaves it in a new place. Buried sediments can become sedimentary rock through compaction and cementation."
        ],
        [
          "Underground",
          "Heat and pressure can make metamorphic rock while it stays solid. Melting produces magma. Cooling and solidifying produce igneous rock. Explore all six routes in the writing lab."
        ]
      ]
    },
    {
      "name": "Minerals",
      "hook": "Is colour enough to identify a mineral?",
      "notes": [
        [
          "Inside a mineral",
          "A mineral is a naturally occurring solid with a crystal structure and a consistent composition. Graphite is the mineral in a pencil core. Quartz can be clear, white or pink."
        ],
        [
          "Lustre and hardness",
          "Lustre tells us how a surface reflects light. Pyrite looks metallic. Quartz looks glassy. Hardness tells us how well a mineral resists scratching. The Mohs scale runs from talc (1) to diamond (10)."
        ],
        [
          "Other clues",
          "Magnetite is attracted to a magnet. Some minerals fluoresce, giving off visible light under ultraviolet light. Use several properties to identify a mineral."
        ]
      ]
    },
    {
      "name": "Changing landscapes",
      "hook": "How could a mountain become sand on a beach?",
      "notes": [
        [
          "Weathering breaks",
          "Rock breaks down or changes in place. A root widening a crack is biological weathering. Freezing water widening a crack is physical weathering. Rainwater reacting with minerals is chemical weathering."
        ],
        [
          "Erosion carries",
          "Water, wind, ice and gravity move fragments. A river can carry grains downstream. Wind can carry Saharan dust to Spain during a calima."
        ],
        [
          "Deposition drops",
          "The grains settle in a new place. A river can build a delta at its mouth, wind can build dunes, and waves can deposit sand on a beach."
        ]
      ]
    }
  ]
};
