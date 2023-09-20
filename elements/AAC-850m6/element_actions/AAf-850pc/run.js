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
  
    var url = baseUrl + "/automate/getflow/" + instancia;
    
    
    
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("uazapi", "true");
    myHeaders.append("apikey", properties.apikey);
    
  
    var raw = 
    {
      "name": properties.name
  
     };
  
    
  
    // Converta o objeto raw em uma string JSON
    var rawString = JSON.stringify(raw);
  
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: rawString,
       
    };
    
  
    
  
  
    
  //instance.publishState('bot', null);
  
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
            //instance.publishState('bot_/_log', "bot");
            
              if (properties.export === true) { //se export verdadeiro
                // Limpar as chaves que começam com '_p_'
                let cleanedJsonString = JSON.stringify(resultObj, null, 2).replace(/"_p_/g, '"');
                let cleanedResultObj = JSON.parse(cleanedJsonString);

                // Remover as propriedades indesejadas do objeto
               
				  let { _id, owner, default: _, startCommandWord, variables, __v, ...rest } = cleanedResultObj;


                // Substituir os valores das variáveis por vazio
                if (variables) {
                    variables = variables.map(v => {
                        return {
                            folder: v.folder,
                            name: v.name,
                            value: '',  // Removendo o valor
                            doc: v.doc
                        };
                    });
                }

                // Substituindo a chave 'variables' no objeto restante (rest)
                rest.variables = variables;

                // Publicar o estado
                instance.publishState('export', JSON.stringify(rest, null, 2));
            }

            
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