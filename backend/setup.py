# packaging_tutorial/setup.py
import setuptools

setuptools.setup(
    name="reactmindmap-backend",
    version="0.0.1",
    author="catwang01",
    author_email="edwardelricwzx@gmail.com",
    description="Backend project for react mind map",
    url="https://github.com/catwang01/react-mindmap",
    project_urls={
        "Bug Tracker": "https://github.com/catwang01/react-mindmap/issues"
    },
    packages=setuptools.find_packages(),
    python_requires=">=3.6",
)