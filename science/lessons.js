'use strict';

// The section numbers and PDF page numbers refer to the scanned class notebook.
const classBook = {
  chapters: [
    {id:'1.1', name:'Rocks', es:'Rocas', pages:'5', first:'rocks'},
    {id:'1.2', name:'Types of rocks', es:'Tipos de rocas', pages:'5–7', first:'igneous'},
    {id:'1.3', name:'Rock Cycle', es:'El ciclo de las rocas', pages:'8', first:'ig-sed-1'},
    {id:'1.4', name:'Minerals', es:'Minerales', pages:'9–11', first:'mineral'},
    {id:'1.5', name:'Geological Processes', es:'Procesos geológicos', pages:'12–13', first:'weathering'}
  ],
  art: {
    granite:'Granito con tres minerales señalados: cuarzo, feldespato y mica.',
    grains:'Primero se rompe el granito en granos. El agua se lleva los granos sueltos.',
    layers:'La compactación presiona los granos y la cementación los une en una roca.',
    pressure:'La roca sedimentaria cambia a metamórfica por calor y presión, mientras sigue sólida.',
    cooling:'El magma se enfría y solidifica para formar una roca ígnea.',
    basalt:'La lava que se enfría en la superficie forma basalto.',
    sediment:'Granos de sedimento sueltos y una pieza de arenisca con capas.',
    marble:'Una muestra de caliza y otra de mármol, la roca que puede formarse a partir de ella.'
  },
  lessons: [
    {id:'rocks', chapter:'1.1', title:'Inside a rock', art:'granite',
      idea:'A rock is made of one or more minerals. Granite contains quartz, feldspar and mica.',
      prompt:'Which one is the whole rock?', choices:['Quartz','Granite'], answer:1,
      hint:'Mira el dibujo. Las tres etiquetas señalan partes de la misma roca.', why:'Granite is the whole rock. Quartz is one of its minerals.'},
    {id:'igneous', chapter:'1.2', title:'Igneous rocks', art:'basalt',
      idea:'Magma cools underground. Lava cools at the surface. Both form igneous rock.',
      prompt:'Basalt forms when lava cools. Where does it form?',choices:['At the surface','Deep underground'],answer:0,
      hint:'Al salir a la superficie, el magma recibe el nombre de lava.',why:'Basalt forms at the surface. This is an extrusive igneous rock.'},
    {id:'sedimentary',chapter:'1.2',title:'Sedimentary rocks',art:'sediment',
      idea:'Small pieces of rock are sediments. They can form layers that become sedimentary rock.',
      prompt:'What is sandstone made from?',choices:['Melted lava','Grains of sand'],answer:1,
      hint:'Sand significa arena. Observa los granos que aparecen a la izquierda.',why:'Sand grains are pressed and cemented together to make sandstone.'},
    {id:'metamorphic',chapter:'1.2',title:'Metamorphic rocks',art:'marble',
      idea:'Heat and pressure can change one solid rock into another. Limestone can become marble.',
      prompt:'Does the limestone melt when it becomes marble?',choices:['Yes, it melts.','No, it stays solid.'],answer:1,
      hint:'Si se fundiera, el resultado sería magma. Aquí se forma mármol.',why:'Limestone changes while solid. Marble is a metamorphic rock.'},
    {id:'mineral',chapter:'1.4',title:'Mineral properties',
      idea:'A mineral is a natural solid with a crystal structure. Lustre tells us how it reflects light.',
      prompt:'Pyrite looks shiny like metal. Which property is this?',choices:['Lustre','Hardness'],answer:0,
      hint:'Lustre significa brillo. Hardness es la resistencia a que lo rayen.',why:'Metallic lustre describes how light reflects from pyrite.'},
    {id:'hard',chapter:'1.4',title:'The scratch test',
      idea:'Hardness tells us how hard a mineral is to scratch. On the Mohs scale, talc is 1 and diamond is 10.',
      prompt:'Which mineral is harder to scratch?',choices:['Talc','Diamond'],answer:1,
      hint:'En la escala de Mohs, un número mayor indica más resistencia al rayado.',why:'Diamond is 10 on the scale. It resists scratching better than talc.'},
    {id:'weathering',chapter:'1.5',title:'Weathering breaks',
      idea:'A root grows into a crack. The rock breaks into pieces. The pieces are still there.',
      prompt:'Which process broke the rock?',choices:['Weathering','Deposition'],answer:0,
      hint:'La raíz rompe la roca en el mismo lugar. Todavía no hay transporte.',why:'A living root breaks rock in place. This is biological weathering.'},
    {id:'erosion',chapter:'1.5',title:'Erosion carries',
      idea:'A river picks up grains and carries them downstream.',
      prompt:'What process moves the grains?',choices:['Deposition','Erosion'],answer:1,
      hint:'Piensa en lo que hace el río mientras lleva los granos de un sitio a otro.',why:'Erosion transports the grains. Wind, ice and gravity can also move them.'},
    {id:'deposition',chapter:'1.5',title:'Deposition drops',
      idea:'The river slows down near the sea. Sand settles at its mouth.',
      prompt:'What is happening as the sand settles?',choices:['Deposition','Melting'],answer:0,
      hint:'Cuando el río deja la arena, esta se acumula en otro lugar.',why:'Deposition leaves sediment in a new place. It can build a delta.'}
  ],
  routes: {
    'ig-sed': {title:'Granite to sandstone', terms:['Granite','Sediments','Sandstone'],
      clues:[
        {art:'grains',idea:'Granite can become sandstone. First, weathering breaks granite into grains. Erosion carries them away.',prompt:'Complete the sentence. Erosion ___ the grains.',choices:['carries','cements'],answer:0,hint:'El granito ya se rompió. Ahora el río se lleva los fragmentos.',why:'Weathering breaks the rock. Erosion carries the pieces.'},
        {art:'layers',idea:'The grains settle in layers. Compaction presses them together. Cementation binds them.',prompt:'Which comes last: loose grains or cemented rock?',choices:['Loose grains','Cemented rock'],answer:1,hint:'Primero hay granos sueltos. Piensa en qué los mantiene unidos al final.',why:'Cementation binds the grains into a new sedimentary rock.'}
      ], task:'How can granite become sandstone?',starter:'First, weathering breaks…',focus:'¿Has dicho qué une los granos para formar la roca nueva?'},
    'ig-met': {title:'Granite to gneiss',terms:['Granite','Gneiss'],
      clues:[{idea:'Granite can change into gneiss deep underground.',prompt:'Which changes granite while it stays solid?',choices:['Heat and pressure','Erosion and deposition'],answer:0,hint:'Imagina la roca enterrada recibiendo calor y presión.',why:'Heat and pressure can change solid granite into gneiss.'}],
      task:'How can granite become gneiss?',starter:'Deep underground, heat and…',focus:'¿Se entiende que el granito cambió sin fundirse?'},
    'sed-met': {title:'Limestone to marble',terms:['Limestone','Marble'],
      clues:[{idea:'Limestone is sedimentary. Marble is metamorphic.',prompt:'What changes solid limestone into marble?',choices:['Melting and cooling','Heat and pressure'],answer:1,hint:'La caliza se transforma cuando sigue sólida.',why:'Heat and pressure change the limestone while it stays solid.'}],
      task:'How can limestone become marble?',starter:'Heat and pressure change…',focus:'¿Nombraste el calor y la presión en tu explicación?'},
    'sed-ig': {title:'Sedimentary to igneous',terms:['Sedimentary','Metamorphic','Magma','Igneous'],
      clues:[
        {art:'pressure',idea:'Follow the route on page 8. Heat and pressure first change sedimentary rock while it stays solid.',prompt:'Which rock comes before magma on this route?',choices:['Igneous rock','Metamorphic rock'],answer:1,hint:'En el esquema del cole, el calor y la presión forman primero otra roca sólida.',why:'Metamorphic rock forms first. Later, it can melt into magma.'},
        {art:'cooling',idea:'The metamorphic rock melts into magma. Now the magma must become solid again.',prompt:'What happens to the magma next?',choices:['It cools and solidifies.','It breaks into sand.'],answer:0,hint:'El magma ya está fundido. Para que vuelva a ser roca, tiene que enfriarse.',why:'Magma cools and solidifies to form igneous rock.'}
      ],task:'How can sedimentary rock become igneous rock on the route in your book?',starter:'First, heat and pressure…',focus:'¿Aparecen la roca metamórfica y el magma, en ese orden?'},
    'met-ig': {title:'Gneiss to igneous rock',terms:['Gneiss','Magma','Igneous rock'],
      clues:[{idea:'Gneiss is a metamorphic rock. It can melt underground.',prompt:'What forms when gneiss melts?',choices:['Sediments','Magma'],answer:1,hint:'¿Cómo se llama la roca fundida que está bajo tierra?',why:'Melting produces magma. Cooling and solidifying can then form igneous rock.'}],
      task:'How can gneiss become igneous rock?',starter:'The metamorphic rock melts…',focus:'¿Explicaste tanto la fusión como el enfriamiento?'},
    'met-sed': {title:'Gneiss to sedimentary rock',terms:['Gneiss','Sediments','Sedimentary rock'],
      clues:[{idea:'Gneiss is exposed at the surface. Loose grains can break away and travel.',prompt:'What happens before the grains are cemented?',choices:['They settle in layers.','They turn into magma.'],answer:0,hint:'Tras ser transportados, los granos se acumulan en otro sitio.',why:'Weathering and erosion supply grains. After deposition, compaction and cementation form rock.'}],
      task:'How can gneiss become sedimentary rock?',starter:'At the surface, weathering…',focus:'¿Dijiste cómo los fragmentos sueltos vuelven a formar una roca?'}
  },
  reflections:[
    {id:'learned',question:'What did I learn today?',support:'¿Qué puedes explicar ahora?'},
    {id:'difficult',question:'What was difficult?',support:'¿En qué paso tuviste que pensar un poco más?'},
    {id:'tomorrow',question:'What will I practise tomorrow?',support:'Elige una cosa pequeña para mañana.'}
  ]
};
