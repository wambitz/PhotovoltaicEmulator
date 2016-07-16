import os

class FilesUtility:
    """This class takes one argument, files path, generate a list 
    of all elements and then delete them"""
    
    def __init__(self, filesPath):
        self.filesPath = filesPath
        
    def deleteFiles(self):
        filesList = os.listdir(self.filesPath)
        if len(filesList) > 10:
            for file in filesList:
                 os.remove(self.filesPath + file)
        

