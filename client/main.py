import pandas as pd
import numpy as np
import pickle

with open("../server/artifacts/medicare_disease_prediction.pickle","rb") as f:
        model = pickle.load(f)

test=pd.read_csv("../model/Testing.csv",error_bad_lines=False)
x_test=test.drop('prognosis',axis=1)


# symptoms = ['itching','skin_rash','nodal_skin_eruptions']
def predict(symptoms):
    try:
        col=x_test.columns
        inputt = [str(x) for x in symptoms]

        b=[0]*132
        for x in range(0,132):
            for y in inputt:
                if(col[x]==y):
                    b[x]=1
        b=np.array(b)
        b=b.reshape(1,132)
        prediction = model.predict(b)
        prediction=prediction[0]
    except:
        prediction = -1
    return prediction