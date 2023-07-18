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

    var url = baseUrl + "/chat/getBase64FromMediaMessage/" + instancia;
    
    
    
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/json");
  //  myHeaders.append("uazapi", "true");
    myHeaders.append("apikey", properties.apikey);
    

   

var raw = JSON.stringify(
{
  "key": {
      "id": properties.id
    }
  }

);

    

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
      instance.publishState('downloadmsg', resultObj);
			
    //  base64 em blob
        const byteCharacters = atob(resultObj._p_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: resultObj._p_mimetype});

        // Pega a extensão baseada no mimeType
        const splitMimeType = resultObj._p_mimetype.split('/');
        const extension = splitMimeType[splitMimeType.length - 1].split(';')[0];

        // Pega o nome do arquivo ou gera um com base no mimeType
        let fileName = "";
        if(resultObj._p_mediaType === "documentMessage") {
            fileName = resultObj._p_fileName;
        } else {
            fileName = `file.${extension}`;
        }

        // Cria um novo objeto File com a extensão do arquivo
        const file = new File([blob], fileName, {type: resultObj._p_mimetype});

        // Criando URL do File
        const fileUrl = URL.createObjectURL(file);
        instance.publishState('blobUrl', fileUrl);
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
  });




}