function(instance, properties, context) {

    //console.log (properties.texto)
	let texto = properties.texto

    
  // Formata negrito e itálico aninhados
  texto = texto.replace(/\*_(\S(.*?\S)?)_\*/g, '[b][i]$1[/i][/b]');
  texto = texto.replace(/_\*(\S(.*?\S)?)\*_/g, '[i][b]$1[/b][/i]');

  // Formata negrito - assegura que não comece nem termine com espaço
  texto = texto.replace(/\*(\S(.*?\S)?)\*/g, '[b]$1[/b]');

  // Formata itálico - assegura que não comece nem termine com espaço
  texto = texto.replace(/_(\S(.*?\S)?)_/g, '[i]$1[/i]');

  // Formata tachado - assegura que não comece nem termine com espaço
  texto = texto.replace(/~(\S(.*?\S)?)~/g, '[s]$1[/s]');

	instance.publishState('textoFormatado', texto);


// Imprima o texto formatado
//console.log(texto);



}