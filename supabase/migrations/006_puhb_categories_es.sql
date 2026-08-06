-- Spanish for the whole menu. Same voice as the English: plain verbs, the
-- dare is the joke and never the person. "Tú" throughout.
--
-- Nulls fall back to the English at render time, so a category added later
-- without a translation degrades to English rather than to a blank card.

alter table puhb_categories add column label_es text;
alter table puhb_categories add column short_label_es text;
alter table puhb_categories add column blurb_es text;

update puhb_categories set label_es = v.label, short_label_es = v.short, blurb_es = v.blurb
from (values
  ('pepper',    'Chile habanero, en cámara',                  'Chile habanero',   'Cómetelo y quédate en cámara 60 segundos.'),
  ('hair',      'Píntate el pelo de un color ridículo',       'Tinte de pelo',    'Antes y después en una sola toma.'),
  ('plunge',    'Baño de hielo, 60 segundos',                 'Baño de hielo',    'Toma continua, con cronómetro a la vista.'),
  ('outfit',    'Sal a la calle con ese atuendo',             'El atuendo',       'Todo el día, y al menos un desconocido reacciona.'),
  ('cover',     'Canta un cover, mal, en público',            'Cover en público', 'Una toma, sin ediciones.'),
  ('dance',     'Coreografía en un lugar público',            'Baile en público', 'Una toma, apréndetela antes.'),
  ('sign',      'Sostén un cartel en un lugar concurrido',    'Cartel público',   '10 minutos, el cartel legible.'),
  ('ex',        'Mándale a tu ex lo que te digan',            'Mensaje al ex',    'Captura del envío, tapa sus datos.'),
  ('bio',       'Cambia tu bio por 7 días',                   'Cambio de bio',    'Captura del día 1 y del día 7.'),
  ('haircut',   'Que el internet elija tu corte de pelo',     'Corte de pelo',    'Antes y después.'),
  ('pushups',   '100 lagartijas, una sola toma',              '100 lagartijas',   'Una toma, sin cortes.'),
  ('flavor',    'Cómete la peor combinación de sabores',      'Peor sabor',       'Una toma, y te la terminas.'),
  ('serenade',  'Dale serenata a una cafetería entera',       'Serenata',         'Una toma, canción completa, al menos una mesa reacciona.'),
  ('anthem',    'Canta el himno en un supermercado',          'Himno',            'Una toma, parado firme, hasta que alguien voltee.'),
  ('busk',      'Toca en la calle 20 minutos con sombrero',   'Músico callejero', 'Una toma de los 20 minutos completos, el sombrero visible y lo que juntaste al final.'),
  ('compliment','Halaga a 20 desconocidos en 10 minutos',     '20 halagos',       'Una toma, cuéntalos en voz alta.'),
  ('tedtalk',   'Da una charla de 2 minutos a desconocidos en un parque', 'Charla en el parque', 'Una toma, desconocidos reales, y siguen ahí al final.'),
  ('commentate','Narra tus compras del súper en voz alta',    'Narración',        'Una toma, todo el súper, voz de narrador deportivo, con otros clientes audibles.'),
  ('openmic',   'Haz 60 segundos en un micrófono abierto',    'Micrófono abierto','Una toma desde el escenario, con el público audible.'),
  ('freehugs',  'Sostén un cartel de ABRAZOS GRATIS 15 minutos','Abrazos gratis', 'Una toma, cartel legible, solo quien se acerque por su cuenta.'),
  ('rate',      'Pide a 10 desconocidos que califiquen tu look','Calificaciones', 'Una toma, las diez respuestas audibles.'),
  ('magic',     'Falla un truco de magia 10 veces en público','Magia mala',       'Una toma, diez intentos, todos malos.'),
  ('rhyme',     'Habla solo en rima durante una hora',        'Hora en rima',     'Una toma de una conversación real, al menos 10 minutos en cámara.'),
  ('accent',    'Mantén un acento falso todo el día',         'Acento falso',     'Una toma con al menos tres interacciones reales, sin que se te caiga el acento.'),
  ('backwards', 'Recita el abecedario al revés en una fila',  'Abecedario',       'Una toma, en voz alta, en una fila real, sin apuntes.'),
  ('pi',        'Recita 50 decimales de pi de memoria en público','50 decimales de pi','Una toma, sin apuntes, en voz alta frente a desconocidos.'),
  ('eyebrows',  'Píntate las cejas de un color ridículo',     'Cejas',            'Antes y después en una toma, más una foto a la luz del día.'),
  ('beard',     'Rasúrate la barba con una forma ridícula',   'Barba rara',       'Antes y después en una toma, y luego sal así a la calle.'),
  ('nails',     'Uñas del color que elija el internet, 7 días','Uñas',            'Pintándotelas en una toma, y una foto de la mano el día 7.'),
  ('wig',       'Usa peluca todo el día y nunca la menciones','La peluca',        'Una toma con al menos dos interacciones donde no le dices a nadie.'),
  ('sockssandals','Calcetines con sandalias en público todo el día','Calcetines y sandalias','Una toma fuera de casa, con los pies claramente en cámara.'),
  ('mismatch',  'Zapatos disparejos todo el día en la calle', 'Zapatos disparejos','Una toma fuera de casa, ambos pies en cámara, y alguien que lo note.'),
  ('suitbeach', 'Traje completo en la playa todo el día',     'Traje en la playa','Una toma en la arena, con el traje puesto y gente alrededor.'),
  ('facepaint', 'Deja que un desconocido te dibuje en la cara','Dibujo en la cara','Una toma, solo marcador lavable, y el dibujo lo elige esa persona.'),
  ('lemon',     'Cómete un limón entero como si fuera manzana','Limón entero',    'Una toma, con cáscara y todo, sin cortes.'),
  ('onion',     'Cómete una cebolla cruda como si fuera manzana','Cebolla cruda', 'Una toma, sin cortes, y te la terminas.'),
  ('mystery',   'Pide lo más raro del menú y cómetelo',       'Lo más raro del menú','Una toma pidiéndolo y otra terminándotelo.'),
  ('babyfood',  'Prueba tres papillas de bebé en cámara',     'Papilla de bebé',  'Una toma, las tres, con calificaciones honestas.'),
  ('wallsit',   'Sentadilla contra la pared, 2 minutos',      'Sentadilla en pared','Toma continua, cronómetro visible, sin apoyarte en nada más.'),
  ('plank',     'Plancha de 3 minutos',                       'Plancha 3 min',    'Toma continua, con cronómetro visible.'),
  ('burpees',   '50 burpees en una plaza pública',            '50 burpees',       'Una toma, los cincuenta, con gente alrededor.'),
  ('coldsing',  'Ducha fría cantando todo el tiempo',         'Cantar en frío',   'Toma continua, 3 minutos, cronómetro visible, y no dejas de cantar.'),
  ('pfp',       'Foto de perfil que elija el internet, 7 días','Cambio de foto',  'Captura del día 1 y del día 7, con el perfil público.'),
  ('voicenote', 'Manda una nota de voz cantando al grupo familiar','Nota de voz familiar','Captura del envío, tapa a los demás.'),
  ('diary',     'Lee tu diario de adolescente en voz alta',   'Diario adolescente','Una toma, con tu cara y la página en cámara, tapando otros nombres.')
) as v(id, label, short, blurb)
where puhb_categories.id = v.id;
