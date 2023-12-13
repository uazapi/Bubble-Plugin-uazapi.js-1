function(instance, properties, context) {
    
  
    connectionState();

    function connectionState() {
  
        const { baseUrl, instancia } = getBaseUrlAndInstance();
        const url = `${baseUrl}/instance/connectionState/${instancia}`;
        return sendRequest(url)
            .then(resultObj => {
                
               
            console.log(resultObj);
            
            instance.publishState('instanceName', resultObj.instance || "");
            instance.publishState('apikey', resultObj.instanceInfo?.instance.apikey || "");
            instance.publishState('owner', resultObj.instanceInfo?.instance.owner || "");
            instance.publishState('profileName', resultObj.instanceInfo?.instance.profileName || ""); 
            instance.publishState('profilePictureUrl', resultObj.instanceInfo?.instance.profilePictureUrl || "");
            instance.publishState('connectionStatus', resultObj.connectionStatus?.state || ""); 
            instance.publishState('qrcode', resultObj.qrcode?.base64 || "");

                                  
            // Agendar próxima execução se estiver conectando, gerando qr code
            
            if (resultObj.connectionStatus?.state === 'connecting') {
            let interval;
            interval = 5000; // 5 segundos
            
            setTimeout(connectionState, interval);
            
			}
            return ;
            
        })
            .catch(error => {
                if (error.message === 'not ready') {
                    throw error;
                } else {
                    handleGlobalError(error);
                }
            });
    

    }
    
    
    
    function getBaseUrlAndInstance() {
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
        
        instance.data.baseUrl = baseUrl;
        instance.data.instancia = instancia;
        instance.data.apikey = properties.apikey;
                                  
        return { baseUrl, instancia };
    }

    
    
    
    function sendRequest(url, method = 'GET', body = null) {
        const headers = {
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            //"uazapi": "true",
            "apikey": properties.apikey
        };
        
        const requestOptions = {
            method: method,
            headers: headers,
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        
        instance.publishState('error', false);
        instance.publishState('error_log', '');

        return fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                    
                    
                }
                return response.json();
            });
    }


    

 
    
    

    function handleGlobalError(error) {
        console.error(error);
        instance.publishState('error', true);
        instance.publishState('error_log', error.toString());
        instance.triggerEvent('errorEvent');
        
            //zerar tudo
        	instance.publishState('instanceName', "");
            instance.publishState('apikey', "");
            instance.publishState('owner', "");
            instance.publishState('profileName', "");
            instance.publishState('profilePictureUrl', "");
            instance.publishState('connectionStatus', "");
            instance.publishState('qrcode', "");
    }


}