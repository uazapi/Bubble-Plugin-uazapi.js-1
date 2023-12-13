function(instance, properties, context) {

        const baseUrl = instance.data.baseUrl;
        const instancia = instance.data.instancia;
        const apikey = instance.data.apikey;
  
      
    connectionState();

    function connectionState() {
        

        
        
        const url = `${baseUrl}/instance/connectionState/${instancia}`;
        return sendRequest(url)
            .then(resultObj => {
                
               
            console.log(resultObj);
            
            instance.publishState('instanceName', resultObj.instance);
            instance.publishState('apikey', resultObj.instanceInfo?.instance.apikey);
            instance.publishState('owner', resultObj.instanceInfo?.instance.owner); //ok
            instance.publishState('profileName', resultObj.instanceInfo?.instance.profileName); //ok
            instance.publishState('profilePictureUrl', resultObj.instanceInfo?.instance.profilePictureUrl);
            instance.publishState('connectionStatus', resultObj.connectionStatus?.state); //ok
            instance.publishState('qrcode', resultObj.qrcode?.base64);
            
            
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
    
    
    
    
    
    function sendRequest(url, method = 'GET', body = null) {
        const headers = {
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            //"uazapi": "true",
            "apikey": apikey
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