import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View
} from "react-native";

const C = { ink:"#17202A", blue:"#315E78", pale:"#EAF3F7", line:"#D9E2E7", white:"#FFFFFF", muted:"#65727A" };

const DISCLAIMER = "SurgicGuide Limited is a hypothetical company created for academic and illustrative purposes. No information in this app should be interpreted as medical advice, a clinical recommendation, or a representation that any product or technology has been clinically validated, approved, or authorised for use.";

const PRODUCT = [
["Challenges of tumour resection", "Cancer is a life-threatening disease that is very difficult to treat because of the recurrence after surgical resection. Cancer surgeries are challenging because a ‘complete’ resection may risk damaging surrounding tissue and affecting organ function, whereas a safer and more cautious approach is often followed by tumour recurrence, so patients must undergo follow-up treatments like chemotherapy or second stage surgery (22). More fundamentally, tumour boundaries are often indistinguishable to the naked eye, and smaller lesions can easily remain obscured during surgery. These factors all contribute to the high recurrence rate of cancer."],
["Current solution: image-guided surgery", "Several imaging modalities are currently available to provide intraoperative surgical guidance, including ultrasound, magnetic resonance imaging (MRI), computed tomography (CT) and fluorescence imaging. Although these tools are in use for tumour delineation, most of them are constrained by clinical limitations including specialised equipment, cost, interpretation requirements, processing time and reliance on signal intensity (23, 24)."],
["Overview of AFS", "To address the shortcomings of conventional image-guided surgery, we propose the AI-integrated FLIM System (AFS) as the state-of-the-art tool for tumour delineation. AFS combines high-speed FLIM instrument with a centralised online database and a cloud-based artificial intelligence engine to transform fluorescence lifetime data into annotated images and meaningful parameters."],
["Principle of AI-integrated FLIM system", "AFS combines fluorescence lifetime imaging microscopy (FLIM) with a flexible endoscope to provide rapid in vivo inspection of human tissue. AFS is based on time-correlated single photon counting (TCSPC). It utilises pulsed laser as excitation source and single photon avalanche diode (SPAD) sensors to capture spatially resolved, time-resolved fluorescence signals."],
["Features and advantages", "The data acquisition time is adjustable to balance resolution and imaging speed. Our AI model is trained by machine learning, primarily based on convolutional neural network, which is excellent for pattern recognition (22). The outputs of our AI model are stored in our database and constantly reviewed by our experts for optimisation of the system."]
];

const NONSPECIALIST = [
["What is NAD(P)H?", "NADH and NADPH are electron carriers in cellular metabolism that serve different roles. NADH is mainly involved in processes that break down glucose and yield energy. NADPH is mainly involved in antioxidation and biosynthesis such as production of nucleotides and fatty acids. They are recycled from their oxidised forms, NAD+ and NADP+ respectively. Due to their roles in multiple pathways, they reflect cellular metabolism."],
["What is fluorescence?", "When a fluorescent molecule (fluorophore) absorbs a photon at a specific excitation wavelength, it transitions from ground state to excited states. The fluorophore may return to the ground state through radiative decay by emitting a photon with longer wavelength (fluorescence), or through non-radiative decay, which releases the energy without emitting a photon."],
["What is FLIM?", "Fluorescence lifetime is the average time in which a fluorophore spent in its excited state before emitting fluorescence. Fluorescence lifetime imaging microscopy (FLIM) works like a stopwatch, which measures the time delay between a laser pulse and the detection of the resulting fluorescence (Fig A). It takes multiple measurements to generate a histogram that shows photon count as a function of time (Fig B). The fluorescence lifetime is determined by fitting the histogram with an exponential decay. A FLIM image is a pseudo-color map where each pixel represents an average fluorescence lifetime."],
["The fluorescence lifetime of NAD(P)H", "NADH and NADPH have the same fluorescence lifetime (0.4 ns) when they are free in solution. Enzyme-bound NADPH has longer fluorescence lifetime than enzyme-bound NADH (4.4 ns and 1.5 ns). Fluorescence lifetime of enzyme-bound NAD(P)H depends on enzyme binding configuration and which enzyme it binds (18, 19)."],
["Tumour margin delineation with FLIM", "Cancer cells reprogramme their metabolism to support rapid cell proliferation. It leads to significant changes in cellular redox states, composition of enzymes that bind NAD(P)H and the free to bound ratio of NAD(P)H. Therefore, the fluorescence lifetimes of cancer and normal tissues are significantly different. This allows FLIM to delineate tumour margin, thereby guiding tumour resection in surgery."]
];

const SPECIALIST = [
["NAD(P)H as an Indicator of Metabolism", "Nicotinamide adenine dinucleotide (NAD+) and nicotinamide adenine dinucleotide phosphate (NADP+) are electron carriers crucial to human metabolism. They exist in equilibrium with their reduced form, NADH and NADPH respectively. Together, NADH and NADPH are called NAD(P)H (1)."],
["NAD(P)H and cancer metabolism", "Compared to normal cells, cancer cells preferentially use glycolysis rather than oxidative phosphorylation for ATP production despite the presence of oxygen, which is known as the Warburg effect (2). The Warburg effect is one of the phenomenon that shows cancer cells modify their metabolism to support proliferation."],
["Distinguish cancer tissue from normal tissue", "Although the Warburg effect is not a universal phenomenon for all cancer types, it has been shown consistently that the metabolism and microenvironment cancer cells is significantly different from normal cells. These affect the properties of fluorescence molecules."],
["Application of FLIM in cancer surgery", "In contrast to fluorescence intensity measurements, fluorescence lifetime imaging microscopy (FLIM) provides a robust metric for delineating tumour resection margin. Fluorescence lifetime is the duration in which a fluorophore stays in its excited state before returning to the ground state. Therefore, fluorescence lifetime is very sensitive to microenvironment and metabolic states."]
];

function Header({ eyebrow, title, intro }) {
  return <View style={s.hero}><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.h1}>{title}</Text>{intro ? <Text style={s.lead}>{intro}</Text> : null}</View>;
}
function Sections({ data }) {
  return <View>{data.map(([h,b]) => <View style={s.section} key={h}><Text style={s.h2}>{h}</Text><Text style={s.body}>{b}</Text></View>)}</View>;
}
function Disclaimer(){ return <View style={s.disclaimer}><Text style={s.disclaimerTitle}>Academic demonstration</Text><Text style={s.disclaimerText}>{DISCLAIMER}</Text></View>; }

function Home({ go }) {
  return <ScrollView contentContainerStyle={s.page}>
    <Header eyebrow="SURGICGUIDE" title="Advancing precision. Guiding surgery." intro="Explore fluorescence lifetime imaging, cancer metabolism and the proposed AI-integrated FLIM System in a mobile-first educational experience." />
    <View style={s.feature}>
      <Text style={s.featureKicker}>AI-INTEGRATED FLIM SYSTEM</Text>
      <Text style={s.featureTitle}>From fluorescence lifetime data to meaningful parameters</Text>
      <Text style={s.featureBody}>Discover the scientific rationale, proposed system architecture and the role of FLIM in tumour delineation.</Text>
      <TouchableOpacity style={s.primary} onPress={()=>go("Product")}><Text style={s.primaryText}>Explore the system  →</Text></TouchableOpacity>
    </View>
    <Text style={s.label}>EXPLORE THE SCIENCE</Text>
    <TouchableOpacity style={s.card} onPress={()=>go("Science")}><Text style={s.cardTitle}>Science for Non-specialists</Text><Text style={s.cardBody}>A clear introduction to NAD(P)H, fluorescence and FLIM.</Text></TouchableOpacity>
    <TouchableOpacity style={s.card} onPress={()=>go("Specialist")}><Text style={s.cardTitle}>FLIM for Cancer Surgery</Text><Text style={s.cardBody}>Technical background on metabolism, NAD(P)H and fluorescence lifetime.</Text></TouchableOpacity>
    <Disclaimer/>
  </ScrollView>
}
function ContentPage({type}) {
 const map={
  Product:["PRODUCT","AI-integrated FLIM System",PRODUCT],
  Science:["SCIENCE","Science for Non-specialists",NONSPECIALIST],
  Specialist:["SPECIALIST","FLIM for Cancer Surgery",SPECIALIST]
 };
 const [e,t,d]=map[type];
 return <ScrollView contentContainerStyle={s.page}><Header eyebrow={e} title={t}/><Sections data={d}/><Disclaimer/></ScrollView>
}
function Team(){
 return <ScrollView contentContainerStyle={s.page}><Header eyebrow="TEAM" title="Our Team" intro="SurgicGuide Ltd comprises experts from the fields of Biochemistry, Biomedical Engineering and Medical Surgery. We value the dedication of every team member."/><View style={s.card}><Text style={s.cardTitle}>Multidisciplinary by design</Text><Text style={s.cardBody}>Biochemistry · Biomedical Engineering · Medical Surgery</Text></View><Disclaimer/></ScrollView>
}
function More({go}){
 return <ScrollView contentContainerStyle={s.page}><Header eyebrow="MORE" title="SurgicGuide"/><TouchableOpacity style={s.card} onPress={()=>go("Team")}><Text style={s.cardTitle}>Our Team</Text><Text style={s.cardBody}>Meet the multidisciplinary SurgicGuide team.</Text></TouchableOpacity><View style={s.card}><Text style={s.cardTitle}>References</Text><Text style={s.cardBody}>The website source contains 28 scientific references supporting the educational content. Full mobile reference browsing is planned for the next iteration.</Text></View><Disclaimer/></ScrollView>
}

const NAV=[["Home","⌂"],["Product","◇"],["Science","◉"],["Specialist","✦"],["More","•••"]];
export default function App(){
 const [screen,setScreen]=useState("Home");
 const root=NAV.some(x=>x[0]===screen)?screen:"More";
 return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content"/><View style={s.top}><Text style={s.brand}>SurgicGuide</Text><Text style={s.demo}>EDUCATIONAL DEMO</Text></View><View style={{flex:1}}>{screen==="Home"?<Home go={setScreen}/>:["Product","Science","Specialist"].includes(screen)?<ContentPage type={screen}/>:screen==="Team"?<Team/>:<More go={setScreen}/>}</View><View style={s.nav}>{NAV.map(([n,i])=><TouchableOpacity key={n} style={s.navItem} onPress={()=>setScreen(n)}><Text style={[s.navIcon,root===n&&s.active]}>{i}</Text><Text style={[s.navText,root===n&&s.active]}>{n}</Text></TouchableOpacity>)}</View></SafeAreaView>
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:C.white,paddingTop:StatusBar.currentHeight||0},
 top:{height:58,paddingHorizontal:22,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
 brand:{fontSize:20,fontWeight:"800",letterSpacing:-.5,color:C.ink},demo:{fontSize:9,fontWeight:"800",letterSpacing:1.2,color:C.blue},
 page:{padding:22,paddingBottom:42},hero:{paddingTop:20,paddingBottom:24},eyebrow:{fontSize:11,fontWeight:"800",letterSpacing:1.8,color:C.blue,marginBottom:10},
 h1:{fontSize:38,lineHeight:42,fontWeight:"800",letterSpacing:-1.3,color:C.ink},lead:{fontSize:17,lineHeight:26,color:C.muted,marginTop:14},
 feature:{backgroundColor:C.pale,borderRadius:24,padding:24,marginBottom:30},featureKicker:{fontSize:10,fontWeight:"800",letterSpacing:1.5,color:C.blue,marginBottom:10},
 featureTitle:{fontSize:25,lineHeight:31,fontWeight:"800",color:C.ink},featureBody:{fontSize:15,lineHeight:23,color:C.muted,marginTop:10},
 primary:{backgroundColor:C.ink,alignSelf:"flex-start",paddingVertical:13,paddingHorizontal:18,borderRadius:30,marginTop:20},primaryText:{color:C.white,fontWeight:"700"},
 label:{fontSize:11,fontWeight:"800",letterSpacing:1.6,color:C.muted,marginBottom:10},card:{borderWidth:1,borderColor:C.line,borderRadius:18,padding:19,marginBottom:12},
 cardTitle:{fontSize:18,fontWeight:"800",color:C.ink,marginBottom:6},cardBody:{fontSize:14,lineHeight:21,color:C.muted},
 section:{paddingVertical:21,borderBottomWidth:1,borderBottomColor:C.line},h2:{fontSize:23,lineHeight:29,fontWeight:"800",color:C.ink,marginBottom:10},body:{fontSize:16,lineHeight:25,color:C.ink},
 disclaimer:{marginTop:30,backgroundColor:"#F2F3F3",padding:18,borderRadius:16},disclaimerTitle:{fontSize:13,fontWeight:"800",color:C.ink,marginBottom:7},disclaimerText:{fontSize:12,lineHeight:18,color:C.muted},
 nav:{height:70,borderTopWidth:1,borderTopColor:C.line,flexDirection:"row",backgroundColor:C.white,paddingBottom:6},navItem:{flex:1,alignItems:"center",justifyContent:"center"},
 navIcon:{fontSize:18,color:C.muted,marginBottom:3},navText:{fontSize:10,fontWeight:"700",color:C.muted},active:{color:C.blue}
});
