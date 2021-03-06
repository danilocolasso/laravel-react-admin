FROM php:7.3-fpm

# Copy composer.lock and composer.json
COPY composer.lock composer.json /var/www/
#COPY composer.json /var/www/

# Set working directory
WORKDIR /var/www

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libonig-dev \
    libzip-dev \
    ruby-full

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install extensions
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl
RUN docker-php-ext-configure gd --with-gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ --with-png-dir=/usr/include/
RUN docker-php-ext-install gd

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

## Install NPM
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

#---------- DEV settings ----------

# Install Mail Catcher
RUN apt-get install libsqlite3-dev
RUN gem install mailcatcher

# Add user for laravel application
RUN groupadd -g 1000 www
RUN useradd -u 1000 -ms /bin/bash -g www www

## Copy existing application directory contents
COPY . /var/www

## Copy existing application directory permissions
COPY --chown=www:www . /var/www

## Change current user to www
USER www

#---------- PROD settings ----------

#COPY . /var/www
#
#RUN chown -R www-data:www-data \
#        /var/www/storage \
#        /var/www/bootstrap/cache
#
#RUN chmod -R 775 ./storage
#RUN chmod -R 775 ./bootstrap/cache

#---------- end PROD settings ----------

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
