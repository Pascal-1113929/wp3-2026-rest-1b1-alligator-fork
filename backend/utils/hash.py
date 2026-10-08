from argon2 import PasswordHasher

ph = PasswordHasher(memory_cost=65536, time_cost=4, parallelism=2)
