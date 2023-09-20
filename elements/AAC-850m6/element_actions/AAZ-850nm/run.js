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

    var url = baseUrl + "/automate/createflow/" + instancia;
    
    
    
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("uazapi", "true");
    myHeaders.append("apikey", properties.apikey);
    

var raw = {};

try {
  // Se properties.import existir e for uma string JSON válida, 
  // parse e adicione ao objeto raw.
  if (properties.import && properties.import.trim() !== "") {
    var importObject = JSON.parse(properties.import);
    raw = { ...importObject };
  }

  // Se properties.name existir, atualize o campo 'name' em raw.
  if (properties.name && properties.name.trim() !== "") {
    raw.name = properties.name;
  }

} catch (e) {
  console.error("O valor de 'import' não é um JSON válido:", e);
  
}



    

    // Converta o objeto raw em uma string JSON
    var rawString = JSON.stringify(raw);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: rawString,
       
    };
    
  
    
 

    console.log("rawString: ", rawString);
    

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
      
            
            instance.publishState('bot', resultObj);
            
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