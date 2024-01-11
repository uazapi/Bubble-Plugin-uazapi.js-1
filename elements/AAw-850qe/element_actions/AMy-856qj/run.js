function(instance, properties, context) {
    
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

      if (baseUrl) {
    baseUrl = baseUrl.trim();
    }
  if (baseUrl && baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
  }

    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

    var url = baseUrl + "/chat/editChat/" + instancia;
  
   
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("uazapi", "true");
  myHeaders.append("apikey", properties.apikey);
  

  var leadInfo = {};

  if(properties.desativadoFluxoAte != null ) leadInfo.desativadoFluxoAte = properties.desativadoFluxoAte;
  if(properties.nome) leadInfo.nome = properties.nome.trim();
  if(properties.nomecompleto) leadInfo.nomecompleto = properties.nomecompleto.trim();
  if(properties.email) leadInfo.email = properties.email.trim();
  if(properties.cpf) leadInfo.cpf = properties.cpf.trim();
  if(properties.status) leadInfo.status = properties.status.trim();
  if(properties.notas) leadInfo.notas = properties.notas.trim();
  if(properties.atendimentoAberto != null) leadInfo.atendimentoAberto = properties.atendimentoAberto;
  if(properties.responsavelid) leadInfo.responsavelid = properties.responsavelid.trim();
  if(properties.customFields) {
    try {
        leadInfo.customFields = JSON.parse(properties.customFields);
    } catch (e) {
      leadInfo.customFields = [];
        console.log('Erro ao analisar customFields: ', e);
    }
  }
  
  var raw = {
      "_id": properties.id
  };
  
  if(properties.unreadcount != null ) raw.unreadcount = properties.unreadcount;
  
      // Adicionando ou removendo 'tags' em 'leadInfo' com base em 'editTags'
      if (properties.editTags) {
        if (properties.tags) {
            let tags = properties.tags.split('|').map(tag => tag.trim());
            leadInfo.tags = tags.filter(tag => tag); // Remove strings vazias
        } else {
            leadInfo.tags = []; // Remove todas as tags se o array for vazio
        }
    }
    
    // Adicionando ou removendo 'etiquetas' de 'leadInfo' com base em 'editEtiquetas'
    if (properties.editEtiquetas) {
      if (properties.etiquetas) {
          let etiquetas = properties.etiquetas.split('|').map(etiqueta => etiqueta.trim());
          leadInfo.etiquetas = etiquetas.filter(etiqueta => etiqueta); // Remove strings vazias
      } else {
          leadInfo.etiquetas = []; // Remove todas as etiquetas se o array for vazio
      }
    }
    
  if(Object.keys(leadInfo).length > 0) raw.leadInfo = leadInfo;
    

  
  raw = JSON.stringify(raw);

  



  

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
     
  };
  


instance.publishState('resultado', '');
instance.publishState('error', false);
instance.publishState('error_log', '');

fetch(url, requestOptions)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(resultObj => {
  

  if (Object.keys(resultObj).length > 0) {
 
    instance.publishState('resultado', JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""));
    instance.publishState('chat/lead', resultObj);
    instance.triggerEvent('sucessEvent');
    
  }
})
.catch(error => {
  instance.publishState('error', true);
try {
        // Tentativa de converter a mensagem de erro para um objeto e formatá-lo como JSON
        let errorString = error.toString().replace(/"_p_/g, "\"");
        let errorObject = JSON.parse(errorString);
        let formattedError = JSON.stringify(errorObject, null, 2);
        instance.publishState('error_log', formattedError);
       } catch(e) {
        // Se a conversão falhar, apenas use a mensagem de erro como uma string
        let errorString = error.toString().replace(/"_p_/g, "\"");
        instance.publishState('error_log', errorString);
    }

        instance.triggerEvent('errorEvent');

});



}