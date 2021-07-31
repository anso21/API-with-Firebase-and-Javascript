(function() {
    let baseUrl = 'https://my-basic-api-default-rtdb.firebaseio.com/';
    let tbody =  document.querySelector('tbody');
    let loader =  document.querySelector('#loader');
    let loading =  document.querySelector('.loading');
    let alertField = document.querySelector('.alert');
    
    
    // Display datas
    getProducts(baseUrl).then(
        (res) => {
            listData(tbody, res);
        }
    );
        
    
    //add data
    $('#add-form').submit((e)=>{
        e.preventDefault();
    
        // Get form elements value
        let service = $('#service').val();
        let serviceApi = $('#service-api').val();
        let productName = $('#product-name').val();
        let productCode = $('#product-code').val();
        let serviceType = $('#service-type').val();
        let status = $('#status').val();
    
        //create product
        let date = new Date();
    
        const product = {
            "id" : Date.now().toString(),
            "service" : service,
            "serviceApi": serviceApi,
            "productName": productName,
            "productCode": productCode,
            "serviceType": serviceType,
            "status": status,
            "submitedDate":`${ date.getUTCDate()}/${date.getUTCMonth() < 10 ? "0"+date.getUTCMonth(): date.getUTCMonth() }/${date.getUTCFullYear()}`
        };
    
    
        addProduct(product, baseUrl); //adding
    
    });
    
    
    //display data into the correct field
    function listData(tbody, res) {
        if(res === null) {
            tbody.innerText = ('No value submited yet');
        }else{

            // Get Oject returned keys
            const keys = Object.keys(res);
        
            // Truncate tbody
            tbody.innerHTML = "";
        
        
            // Loop the response for displaying
            keys.forEach((k , i) => {
                tr = document.createElement('tr');
                tr.innerHTML = 
                    `
                    <tr>
                        <th scope="row">${i}</th>
                        <th scope="col">${res[k].service}</th>
                        <th scope="col">${res[k].serviceApi}</th>
                        <th scope="col">${res[k].productName}</th>
                        <th scope="col">${res[k].productCode}</th>
                        <th scope="col">${res[k].serviceType}</th>
                        <th scope="col">${res[k].status}</th>
                        <th scope="col">${res[k].submitedDate}</th>
                        <th scope="col">
                            <i class="fa fa-edit edit" id=${res[k].id} data-toggle="modal" data-target=".bd-example-modal-lg"></i> 
                            <i class="fa fa-trash-alt del" id=${res[k].id} data-toggle="modal" data-target="#delModalCenter"></i> </th>
                    </tr>
                    `
                ;
        
                tbody.appendChild(tr);
            });
        }
    
        loader.style.display = "none";
    
    
        // Delete calling
        $('.fa-trash-alt').click((e)=> {
            const id = e.target.id;

            $('.delete-btn').click(e => {
                $('#delModalCenter').hide();
                $('.modal-backdrop').remove();
                deleteProduct(id, baseUrl).then(
                    () => console.log("Operation successfull !"),
                    getProducts(baseUrl).then(
                        (res) => {
                            listData(tbody, res);
                        }
                    )
    
                ).catch(err => console.log(err));
            });
        });
        
    
        // Edit calling
        $('.edit').click((e)=> {
            let id = e.target.id;
            getOneProduct(id, baseUrl)
            .then(response => {
                $('#service-update').val(response.service);
                $('#service-api-update').val(response.serviceApi);
                $('#product-name-update').val(response.productName);
                $('#product-code-update').val(response.productCode);
                $('#service-type-update').val(response.serviceType);
                $('#status-update').val(response.status);
    
                $('#update-form').submit(e => {
                    e.preventDefault();
                    $('#updateModal').hide();
                    $('.modal-backdrop').remove();

                    console.log($('#status-update').val());
                    
                    const product = {
                        'id': id,
                        "service" : $('#service-update').val(),
                        "serviceApi": $('#service-api-update').val(),
                        "productName": $('#product-name-update').val(),
                        "productCode": $('#product-code-update').val(),
                        "serviceType": $('#service-type-update').val(),
                        "status": $('#status-update').val(),
                    };

                    console.log(product);

                    updateProduct(product, baseUrl);
                
                });
    
            }).catch(err => console.log(err));
    
        });
    }
    
    
    
    // Functions based on the CRUD OPP
    function addProduct(product, baseUrl) {
        loading.style.display ="flex";
        return new Promise((resolve, reject) => {
            $.ajax({
                method: "PUT",
                dataType: "json",
                url: `${baseUrl}operators/${product.id}.json`,
                data: JSON.stringify(product)
            }).done(function(response){
                getProducts(baseUrl).then(
                    (res) => {
                        listData(tbody, res);
                    }
                    );
                loading.style.display ="none";
                notify("Opp added successfully !", 'success')
            }).fail(function (err) {
                loading.style.display ="none";
                notify("Adding failed !", 'error')
                reject(err)
            });
        });
    }
    
    function getProducts(baseUrl){
        return new Promise((resolve, reject) => {
            $.ajax({
                method: "GET",
                url: `${baseUrl}operators.json`,
            }).done(function(response){
                resolve(response);
            }).fail((err)=> {
                reject(err);
            });
        })
    }
    
    function getOneProduct(id, baseUrl) {
       return new Promise((resolve, reject) => {
            $.ajax({
                method: "GET",
                url: `${baseUrl}/operators/${id}.json`,
            }).done(function(response){
                resolve(response);
            }).fail((err) => reject(err));
       })
    
    }
    
    function updateProduct(product, baseUrl) {
        loading.style.display ="flex";
        return new Promise((resolve, reject) => {
            $.ajax({
                method: "PATCH",
                dataType: "json",
                url: `${baseUrl}operators/${product.id}.json`,
                data: JSON.stringify(product)
            }).done(function(response){
                getProducts(baseUrl).then(
                    (res) => {
                        listData(tbody, res);
                    }
                    );
                loading.style.display ="none";
                notify("Opp updated successfully !", 'success')
            }).fail(function (err) {
                loading.style.display ="none";
                notify("Updating failed !", 'error')
                reject(err)
            });
        });
    }
    
    function deleteProduct(id, baseUrl) {
        loading.style.display ="flex";
       return new Promise((resolve, reject) => {
            $.ajax({
                method: "DELETE",
                url: `${baseUrl}/operators/${id}.json`,
            }).done(function(){
                notify("Opp deleted successfully !", 'success')
                getProducts(baseUrl).then(
                    (res) => {
                        listData(tbody, res);
                    }
                );
                loading.style.display ="none";
            }).fail(err => {
                notify("Updating failed !", 'error')
                reject(err)
            });
       })
    }

    function notify(text, type) {
        if (type === "success") {
            alertField.classList.remove('alert-danger');
            alertField.classList.add('alert-success');
        } else{
            alertField.classList.remove('alert-success');
            alertField.classList.add('alert-danger');
        }
        alertField.style.display = "block"
        alertField.innerText = text;
        setTimeout(() => {
            alertField.style.display = "none"
        }, 5000);
    }
         
})()