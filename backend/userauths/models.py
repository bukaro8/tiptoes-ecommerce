from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from shortuuid.django_fields import ShortUUIDField
# Create your models here.


class User(AbstractBaseUser):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        email_username, _ = self.email.split("@")
        if self.full_name == "" or self.full_name is None:
            self.full_name = self.email_username
        if self.username == "" or self.username is None:
            self.username = self.email_username
        super(User, self).save(*args, **kwargs)


class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.FileField(
        upload_to="image", default='default/default-user.jpg', null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    pid = ShortUUIDField(unique=True, length=10,
                         max_length=20, alphabet="abcdefghijk")

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)

    def save(self, *args, **kwargs):
        email_username, _ = self.email.split("@")
        if self.full_name == "" or self.full_name is None:
            self.full_name = self.user.full_name

        super(Profile, self).save(*args, **kwargs)
