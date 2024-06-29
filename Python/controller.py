from numpy import matrix
import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import json

matrix = []
parcialMatrix = []
my_list = [] 
list_dict =[0,0,0,0,0,0,0,0,0,0]
my_dict_dimero = {"AA":list_dict,"AT":list_dict,"AC":list_dict,"AG":list_dict,"TA":list_dict,"TT":list_dict,"TC":list_dict,"TG":list_dict,"CA":list_dict,"CT":list_dict, "CC":list_dict,"CG":list_dict, "GA":list_dict,"GT":list_dict,"GC":list_dict,"GG":list_dict }
flag = True




def fillMatrixWithLineData(emptyDict,line, kmero, w):
    flag = True
    
    for i in range(0, len(line)-2):#o -1??
        j = i #Kmere starts at this position
        k = i + 1 #Position to start looking for periodicity
        section = ""
        list_dict_insert =[0,0,0,0,0,0,0,0,0,0]
        #Searching the k-mere
        for e in range(0,kmero):
            if (line[j] == "A" or line[j] == "T" or line[j] == "G" or line[j] == "C"):
                section = section + line[j]
                j = j + 1
            else:
                break
        
        if len(section) != kmero:
            continue
        if (kmero == 2):    #Dimero
            for distance in range(0,w):  
                if (line[k] != "" and line[k+1] != "" and line[k+1] != '\n'):
                    if((line[k]+line[k+1]) == section):
                        list_dict_insert[distance] += 1       
                if (k < 149):
                    k += 1
                else:
                    break      
            emptyDict[section] =  np.add(list_dict_insert,emptyDict[section])
        else:   #Trimero
            for distance in range(0,w):  
                if (line[k] != "" and line[k] != '\n' and line[k+1] != "" and line[k+1] != '\n' and line[k+2] != "" and line[k+2] != '\n'):
                    if((line[k]+line[k+1]+line[k+2]) == section):
                        list_dict_insert[distance] += 1      
                if (k < 149):
                    k += 1
                else:
                    break        
            emptyDict[section] =  np.add(list_dict_insert,emptyDict[section])
    return emptyDict


def plotData(dict, k):
    fig, ax = plt.subplots()
    f = 0
    for key, val in dict.items():
        ax.plot([1,2,3,4,5,6,7,8,9,10], [np.log10(val[0]),np.log10(val[1]),np.log10(val[2]),np.log10(val[3]),np.log10(val[4]),np.log10(val[5]),np.log10(val[6]),np.log10(val[7]),np.log10(val[8]),np.log10(val[9])], label=key)
    ax.legend(bbox_to_anchor=(0.5, -0.15), loc='upper center', ncol=6)
    plt.xlabel("Distance (w)")
    plt.ylabel("Ln Ocurrences")
    plt.legend()
    filename = f'charts/char{"Di" if k == 2 else "Tri"}.png'

    if not os.path.exists('charts'):
        os.makedirs('charts')

    plt.savefig(filename, bbox_inches='tight')
    #plt.show()
    data = []
    for key, val in dict.items():
        data.append({
            'label': key,
            'values': [np.log10(v) for v in val]
        })
    return data


def heatmap(dict):
    # Obtener todas las claves y valores
    keys = list(dict.keys())
    values = list(dict.values())

    # Aplicar logaritmo en base 10 a los valores
    log_values = np.log10(np.maximum(1, np.array(values)))

    # Crear la figura y el eje
    fig, ax = plt.subplots(figsize=(10, 8))  # Puedes ajustar el tamaño según tus necesidades

    # Crear el mapa de calor con valores logarítmicos y colormap 'plasma'
    cax = ax.imshow(log_values, cmap='plasma', interpolation='nearest', aspect='auto')

    # Añadir barra de color
    cbar = fig.colorbar(cax)

    # Etiquetar ejes
    ax.set_xticks(np.arange(log_values.shape[1]))
    ax.set_yticks(np.arange(len(keys)))
    ax.set_xticklabels(np.arange(1, log_values.shape[1] + 1))  # Ajustar las etiquetas según tus necesidades
    ax.set_yticklabels(keys)

    # Rotar etiquetas en el eje x
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    # Ajustar el diseño automáticamente
    plt.tight_layout()

    # Guardar la figura como PNG
    plt.savefig('charts/heatmap.png', dpi=300)  # Puedes ajustar el dpi según tus necesidades

    # Mostrar el mapa de calor
    #plt.show()
    data = {
        'keys': keys,
        'log_values': log_values.tolist()
    }
    return data

def createDictTri():
    my_dict_trimero ={}
    c = ("A", "G", "C", "T")
    for i in c:
        for j in c:
            for k in c:
                my_dict_trimero.update({(i+j+k):list_dict})
    return (my_dict_trimero)

def toJson(data):
    # Supongamos que filledDict es el diccionario que recibes con matrices NumPy
    filledDict = data  # Supongamos que 'data' contiene el diccionario con matrices NumPy

    # Convertir las matrices NumPy a listas de Python
    for key, value in filledDict.items():
        filledDict[key] = value.tolist()

    # Convertir el diccionario a JSON
    json_data = json.dumps(filledDict)

    return json_data

def process_data(kmero):
    bb = open("Nucleosomal.fasta")
    bList = bb.readlines()
    emptyDict = my_dict_dimero
    if (kmero == 3):
        dict_trimero=createDictTri()
        emptyDict = dict_trimero
    else:
        emptyDict = my_dict_dimero
    for i in bList:
        if not (i.startswith(">")):
                my_list.append(i)
                filledDict = fillMatrixWithLineData(emptyDict, i, kmero, 10)

        

    #print(filledDict)     
    #plot_data = plotData(filledDict, kmero)
    #heatmap_data = heatmap(filledDict)
    
    json_data = toJson(filledDict)
    return json_data
    
    

