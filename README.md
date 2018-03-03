### Обновление сборки
```
npm i -g gulp
npm i 
gulp build
```
### Примерный конфиг для nginx
```
server {
    server_name express-ocenka.com;
    root PATH_TO_PROJECT/build/;
    index index.php index.html;

    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location / {
        try_files $uri $uri/ $uri.html /index.php?$args;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires max;
        log_not_found off;
    }


    location ~ \.php$ {
        #NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini
        include fastcgi_params;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_intercept_errors on;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
    }
}
```