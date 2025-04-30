
const iframe = document.getElementById("myIframe");


function mobileSideMenuBtn(materialClick=false){
    const panel = document.getElementById('rightPanel');
    if(materialClick){
        panel.classList.remove('open');
    }else{
        panel.classList.toggle('open');
    }
    if(panel.classList.contains('open')){
        document.getElementById('toggleButton').innerHTML = ">>"
    }else{
        document.getElementById('toggleButton').innerHTML = "<<"
    }
}

document.getElementById('toggleButton').addEventListener('click', (e)=>mobileSideMenuBtn(false));

// Send a message to the iframe
function sendMessageToIframe() {
    const message = { type: "greeting", text: "Hello from Parent!" };
    iframe.contentWindow.postMessage(message, "*");
}


function dataModifier(item){
    return Object.entries(item).reduce((ans,[key,value])=>{
        const [a,b,c] = key.split(":")
        if(a && b && c){
            return ans[a]={
                ...ans,
                [a]:{
                    ...ans[a],
                    [b]:{
                        icon:Object.values(value)[0]?.buttonIcon,
                        mats:value
                    }
                }
            }
        }
        return ans
    },{})
}

var ButtonsData = [];
let firstRender = false

var activePrimeCategory = ""
var activeSubCategory = ""
var activeMat = ""
var activeModel = ""

function rerenderMatsInSubCat(mats){
    const pannel = document.getElementById("bottom_material_selection_pannel")
    pannel.innerHTML = ""

    Object.entries(mats).forEach(([gKey,gValue]) => {

        if(!activeMat){activeMat=[gKey,gValue]}

        const btn = document.createElement('button')
        btn.addEventListener('click',()=>{
            activeMat = [gKey,gValue]
            iframe.contentWindow.postMessage(gValue,"*");
            mobileSideMenuBtn(true);
        })

        const image = document.createElement("img")
        const text = document.createElement("div")
        text.innerHTML = gKey
        image.src = gValue.buttonIcon || ""
        image.alt = "BaseMap "+gKey
        
        btn.classList.add("optionsbuttonSubCats");
        text.classList.add("buttonText")
        image.classList.add("buttonIconImageSubCats")
        
        btn.append(image)
        btn.append(text)
        pannel.append(btn)

        if(activeMat[0]==gKey){
            console.log("activeMat",activeMat,gKey)
            btn.classList.add("selectedBorderSubClass")
        }
    })
}

function rerenderActivePrimeCat(cat){
    const prime = document.createElement("div")
    prime.id = "material_icons_div"
    prime.classList.add("CategoryDivForMaterial")
    // console.log("Active=>",cat)
    Object.entries(cat).forEach(([subCat,value])=>{
        
        if(!activeSubCategory){
            activeSubCategory=[subCat,value]
        }
        const btn = document.createElement('button')
        btn.addEventListener('click',()=>{
            
            console.log("SUBACTIVATING",value)
            activeSubCategory=[subCat,value]
            document.querySelectorAll(".optionsbutton").forEach(e=>e.classList.remove("selectedBorder"))
            btn.classList.add("selectedBorder");
            value.mats && rerenderMatsInSubCat(value.mats)
        
        })

        if(subCat == activeSubCategory[0]){
            btn.classList.add("selectedBorder");
        }

        const image = document.createElement("img")
        const text = document.createElement("div")
        text.innerHTML = subCat
        image.src = value.icon || ""
        image.alt = "BaseMap "+subCat
        
        btn.classList.add("optionsbutton");
        text.classList.add("buttonText")
        image.classList.add("buttonIconImage")
        
        btn.append(image)
        btn.append(text)
        prime.append(btn)

        if(activeSubCategory){
            rerenderMatsInSubCat(activeSubCategory[1].mats)
        }

    })
    return prime
}

window.addEventListener("message", (event) => {
    if(event?.data?.source?.startsWith('react-devtools')) return;
    const cont = document.getElementById("buttons-Container")
    const categoryActiveButtons = document.getElementById("CategoryActiveButtons")

    if(ButtonsData.length!==0 && event.data.length){
        
        
        const modifiedMaterialsData = []
        const modelsData = []
        event.data?.forEach((menuItem) => {

            const menuEntries = Object.keys(menuItem)
            const subCats = menuEntries?.[0].split(":")
            const isMaterial = subCats.length==3
            const materials = []
            if(isMaterial){
                modifiedMaterialsData.push(dataModifier(menuItem))
            }else{
                modelsData.push(menuItem)
            }
        
        },{})
        
        console.log("Data=>",modelsData[0])
        
        
        cont.innerHTML=""
        categoryActiveButtons.innerHTML=""
        // console.log(event.data)

        const categoryDiv = document.createElement('div')
        categoryDiv.classList.add("topPsudoModelsClass")

        modifiedMaterialsData.forEach(e => {
            Object.entries(e).forEach(([primeCat,value])=>{
                const primaryBtn = document.createElement("button")
                primaryBtn.innerHTML = primeCat
            
                const btn = document.createElement('button')
                const text = document.createElement("div")

                text.innerHTML = primeCat;

                if(!activePrimeCategory){activePrimeCategory = [primeCat,value]}

                text.classList.add("optionsbuttonModelText");
                btn.classList.add("optionsbuttonModel");
                value.selected && btn.classList.add("selectedBorder");

                
                btn.appendChild(text)
                categoryDiv.appendChild(btn)
                
                btn.addEventListener('click',()=>{
                    console.log("activating",value)
                    activePrimeCategory = [primeCat,value]
                    document.querySelectorAll(".readOnlyCheckbox").forEach( e=>e.classList.remove("readOnlyCheckbox"))
                    btn.classList.add("readOnlyCheckbox")
                    const preExisting = document.getElementById("material_icons_div")
                    // for first render
                    if(preExisting){cont.removeChild(preExisting)}
                    cont.appendChild(rerenderActivePrimeCat(value))
                })
                
                if(primeCat==activePrimeCategory[0]){
                    btn.classList.add("readOnlyCheckbox")
                }
            })

        })

        const modelsDiv = document.getElementById("modelsButtonContainerDiv")
        modelsDiv.innerHTML=""
        Object.entries(modelsData[0]).forEach(([key,value]) =>{
            
            if(!activeModel){
                activeModel=[key,value]
            }
            const btn = document.createElement("button")
            const btnImage = document.createElement("img")

            btnImage.src = value.params[3]
            btnImage.alt = key+" Image"


            btn.classList.add("modelsButton")
            btnImage.classList.add("modelsButtonImage")

            btn.addEventListener('click',()=>{
                activeModel = [key,value]
                iframe.contentWindow.postMessage(value,"*")
                // iframe.contentWindow.postMessage(activeMat[1],"*")
            })
            
            btn.append(btnImage)

            
            if(activeModel[0]!=key || !activeModel){
                modelsDiv.append(btn)
                // btn.classList.add("selectedModelClass")
            }
        })



        cont.appendChild(categoryDiv)
        if(activePrimeCategory){
            cont.appendChild(rerenderActivePrimeCat(activePrimeCategory[1]))
        }
    }
    ButtonsData = event.data
});