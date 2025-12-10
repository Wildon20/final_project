FROM php:8.2-apache

# Install PHP extensions (PDO MySQL)
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Set Apache document root to /var/www/html
ENV APACHE_DOCUMENT_ROOT=/var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Copy project files
COPY . /var/www/html/

# Set proper permissions (adjust if needed)
RUN chown -R www-data:www-data /var/www/html

# Security/CORS defaults for API (allow same-origin and simple cross-origin)
RUN printf "\n<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
    DirectoryIndex index.html index.php\n\
</Directory>\n" >> /etc/apache2/apache2.conf

# Expose HTTP
EXPOSE 80

# Healthcheck hitting a lightweight PHP endpoint if exists, else root
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -fsS http://localhost/test_auth_system.php || curl -fsS http://localhost/ || exit 1

# Start Apache
CMD ["apache2-foreground"]


