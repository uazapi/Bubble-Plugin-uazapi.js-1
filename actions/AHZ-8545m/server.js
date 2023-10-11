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

    var url = baseUrl + "/webhook/set/" + instancia;
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "uazapi": "true",
        "apikey": apikey
    };

    let raw = 
        //JSON.stringify(
        {
            
      "flowActive": properties.flowActive,
      "flowIgnoreGroups": properties.flowIgnoreGroups,
      "flowPrefixCommand": properties.flowPrefixCommand,
      "flowStopConversation": properties.flowStopConversation,
      "flowStopMinutes": properties.flowStopMinutes,
          
          "enabled": properties.enabled,
          "local_map": properties.local_map,
          "url": properties.webhookurl,
          "STATUS_INSTANCE":properties.STATUS_INSTANCE,
          "QRCODE_UPDATED":properties.QRCODE_UPDATED,
          "MESSAGES_SET":properties.MESSAGES_SET,
          "MESSAGES_UPDATE":properties.MESSAGES_UPDATE,
          "MESSAGES_UPSERT":properties.MESSAGES_UPSERT,
          "SEND_MESSAGE":properties.SEND_MESSAGE,
          "CONTACTS_SET":properties.CONTACTS_SET,
          "CONTACTS_UPSERT":properties.CONTACTS_UPSERT,
          "CONTACTS_UPDATE":properties.CONTACTS_UPDATE,
          "PRESENCE_UPDATE":properties.PRESENCE_UPDATE,
          "CHATS_SET":properties.CHATS_SET,
          "CHATS_UPSERT":properties.CHATS_UPSERT,
          "CHATS_UPDATE":properties.CHATS_UPDATE,
          "CHATS_DELETE":properties.CHATS_DELETE,
          "CONNECTION_UPDATE":properties.CONNECTION_UPDATE,
          "GROUPS_UPSERT":properties.GROUPS_UPSERT,
          "GROUPS_UPDATE":properties.GROUPS_UPDATE,
          "GROUP_PARTICIPANTS_UPDATE":properties.GROUP_PARTICIPANTS_UPDATE
      }
    //  );
  
    
        let requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        uri: url,
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
        webhook_status: resultObj.webhook,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log,
    };






}