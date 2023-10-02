function(properties, context) {
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

    let apikey = properties.apikey;
    if (!apikey || apikey.trim() === "") {
        apikey = context.keys["Global APIKEY"];
    }
    
    if (apikey) {
    apikey = apikey.trim();
    }
    
    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }


    var url = baseUrl + "/chat/editChat/" + instancia;
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "uazapi": "true",
        "apikey": apikey
    };
    

    var leadInfo = {};

    // Separando as tags fornecidas pelo usuário em um array  
    if (properties.deleteTags) {
      leadInfo.tags = [];
    } else if (properties.tags) {
      let tags = properties.tags.split('|').map(tag => tag.trim());
      if (tags.length > 0) {
        leadInfo.tags = tags;
      }
    }
  
    if(properties.disableFlowsUntil) leadInfo.disableFlowsUntil = properties.disableFlowsUntil;
    if(properties.displayName) leadInfo.displayName = properties.displayName.trim();
    if(properties.fullName) leadInfo.fullName = properties.fullName.trim();
    if(properties.email) leadInfo.email = properties.email.trim();
    if(properties.cpf) leadInfo.cpf = properties.cpf.trim();
    if(properties.sourceLead) leadInfo.sourceLead = properties.sourceLead.trim();
    if(properties.statusLead) leadInfo.statusLead = properties.statusLead.trim();
    if(properties.note) leadInfo.note = properties.note.trim();
    if(properties.serviceOpen !== undefined) leadInfo.serviceOpen = properties.serviceOpen;
    if(properties.assignedTo) leadInfo.assignedTo = properties.assignedTo.trim();
    
    var raw = {
        "id": properties.id
    };
    
    if(properties.unreadcount !== undefined) raw.unreadcount = properties.unreadcount;
    if(Object.keys(leadInfo).length > 0) raw.leadInfo = leadInfo;
    
    raw = JSON.stringify(raw);

    let requestOptions = {
        method: 'POST',
        headers: headers,
        uri: url,
        body: raw,
        json: true
    };

    let sentRequest;
    let error;
    error = false;
    let error_log;

    try {
        sentRequest = context.request(requestOptions);
   } catch(e) {
        error = true;
        error_log = e.toString();
    }

    if (sentRequest.statusCode.toString().charAt(0) !== "2") {
        error = true;
       
        return {
            error: error,
            error_log: JSON.stringify(sentRequest.body, null, 2).replace(/"_p_/g, "\""),
        }
    } 


    let resultObj;
    try {
        resultObj = sentRequest.body;
   } catch(e) {
        error = true;
        error_log = `Error getting response body: ${e.toString()}`;
    }

     

    return {
        //webhook_status: resultObj.webhook,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log,
    };

}