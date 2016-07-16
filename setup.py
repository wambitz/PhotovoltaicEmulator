from distutils.core import setup

setup(
    name='pvEmulator',
    version='0.1.0',
    author='Julio Castillo Cruz',
    author_email='a09106724@alumnos.uady.mx',
    packages=['pvemulator', 'pvemulator.test'],
    url='https://github.com/wambitz/photovoltaicEmulator',
    license='LICENSE.txt',
    description='Photovoltaic Simulation.',
    long_description=open('README.txt').read(),
    install_requires=[
        "Flask >= 0.10.1",
        "requests == 2.3.0",
    ],
)