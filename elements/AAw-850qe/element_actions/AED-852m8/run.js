function(instance, properties, context) {
    // 🔓 Grupo - Criar
    let baseUrl = properties.url;
    if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
        baseUrl = context.keys["Server URL"];
    }

    var url = baseUrl + "/group/create/" + properties.instancia + "?convert=true";

    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("apikey", properties.apikey);

    let number = properties.participants && properties.participants.split('|').map(number => number.trim());

    var raw = JSON.stringify(
        {
            "subject": properties.subject,  
            "description": properties.description,
            "participants": number
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

        try {
          
        } catch (error) {
            throw new Error(`Falha ao analisar a resposta como JSON: ${error}`);
        }

        if (resultObj && Object.keys(resultObj).length > 0) {
            instance.publishState('resultado', JSON.stringify(resultObj, null, 2));

           
                instance.publishState('grupo', resultObj);
              
        }
    })
    .catch(error => {
        instance.publishState('error', true);
        instance.publishState('error_log', error.toString());
    });
}