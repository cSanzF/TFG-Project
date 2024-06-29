import bioio
import os
import sys
import controller

class Nucleosome:
    nChromosome = ''
    nStart = ''
    nEnd = ''
    
my_list = [] #Contains all seq
kmero = int(sys.argv[1])
fasta_path = sys.argv[2]
bed_path = sys.argv[3]


#Read Fasta file
ff = bioio.readFasta(path=fasta_path)
#Read Bed file
bb = open(bed_path)
bList = bb.readlines()

#Creation nucleosomal.fasta with collected data  
j=0
if os.path.exists("Nucleosomal.fasta"):
    os.remove("Nucleosomal.fasta")

f = open ("Nucleosomal.fasta","w")
for i in bList:
    line = bList[j].split("\t")
    j=j+1
    chromosome = line[0]
    start = line[1]
    end = line[2]
    totSeq = ff[chromosome]
    seq = totSeq[int(start):int(end)]
    
    my_list.append(seq)
    f.write('>'+ chromosome + ":" + start + "-" + end)
    f.write (seq)
    f.write('\n')

f.close

data = controller.process_data(kmero)
print(data)




