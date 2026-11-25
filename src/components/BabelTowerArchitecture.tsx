import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

// Slotların görünürlüğü kapalı; yerleşim verileri ve duvar hesapları korunur.
const SHOW_SLOTS = false;

const BRONZE_TOWER = {
  name: "Bronz Kule",
  targetTotal: 100,
  segments: 3,
  baseUnits: 12,
  topUnits: 10,
  accentColor: "#cd7f32"
};

function InstancedSlots({ matrices, geometry, material }: {
  matrices: THREE.Matrix4[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const mesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(geometry, material, matrices.length);
    const slotColor = new THREE.Color();
    matrices.forEach((matrix, index) => {
      instance.setMatrixAt(index, matrix);
      // Her yuvaya komşularından ayırt edilebilen, dengeli bir renk ver.
      slotColor.setHSL((index * 0.61803398875) % 1, 0.62, 0.56);
      instance.setColorAt(index, slotColor);
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    instance.computeBoundingSphere();
    return instance;
  }, [geometry, material, matrices]);
  return <primitive object={mesh} />;
}

const SPIRAL_SLOT_LAYOUT: {
  number: number;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  theta: number;
}[] = [
  { number: 1, x: 9.2728879323750562, y: 0.80999999999999994, z: 0.0000000000000000, rotationY: 1.5707963267948966, theta: 0.0000000000000000 },
  { number: 2, x: 9.1705348209790127, y: 0.84344817228024493, z: 0.95281012368156570, rotationY: 1.4672687087538883, theta: 0.10352761804100830 },
  { number: 3, x: 8.9699889107323401, y: 0.87708857543566376, z: 1.8898613297756688, rotationY: 1.3631461044022994, theta: 0.20765022239259709 },
  { number: 4, x: 8.6728691345564375, y: 0.91092343178851276, z: 2.8008845372198179, rotationY: 1.2584216352856725, theta: 0.31237469150922398 },
  { number: 5, x: 8.2818870471614385, y: 0.94495500242248298, z: 3.6757192367272653, rotationY: 1.1530883029765071, theta: 0.41770802381838940 },
  { number: 6, x: 7.8008482556980070, y: 0.97918558808940037, z: 4.5044310024287597, rotationY: 1.0471389862678731, theta: 0.52365734052702362 },
  { number: 7, x: 7.2346412658848003, y: 1.0136175301425938, z: 5.2774312458408934, rotationY: 0.94056643828448205, theta: 0.63022988851041450 },
  { number: 8, x: 6.5892132020915737, y: 1.0482532114978771, z: 5.9855979029858259, rotationY: 0.83336328350829003, theta: 0.73743304328660653 },
  { number: 9, x: 5.8715319867318172, y: 1.0830950576231322, z: 6.6203956473558883, rotationY: 0.72552201471557309, theta: 0.84527431207932346 },
  { number: 10, x: 5.0895347065602454, y: 1.1181455375575207, z: 7.1739941337467048, rotationY: 0.61703498982230087, theta: 0.95376133697259569 },
  { number: 11, x: 4.2520620505627802, y: 1.1534071649613935, z: 7.6393827029230090, rotationY: 0.50789442863449086, theta: 1.0629018981604057 },
  { number: 12, x: 3.3687788752864685, y: 1.1888824991980169, z: 8.0104799168272862, rotationY: 0.39809240950008817, theta: 1.1727039172948084 },
  { number: 13, x: 2.4500811376152871, y: 1.2245741464482784, z: 8.2822362508055729, rotationY: 0.28762086585876845, theta: 1.2831754609361281 },
  { number: 14, x: 1.5069896307823085, y: 1.2604847608595844, z: 8.4507282453069976, rotationY: 0.17647158268590690, theta: 1.3943247441089897 },
  { number: 15, x: 0.55103116512771155, y: 1.2966170457302195, z: 8.5132424168646761, rotationY: 0.064636192826792893, theta: 1.5061601339681037 },
  { number: 16, x: -0.40589195125686733, y: 1.3329737547304858, z: 8.4683472489473441, rotationY: -0.047893826782998694, theta: 1.6186901535778953 },
  { number: 17, x: -1.3516430576757412, y: 1.3695576931620037, z: 8.3159516294144993, rotationY: -0.16112715901535157, theta: 1.7319234858102481 },
  { number: 18, x: -2.2740016154190656, y: 1.4063717192566130, z: 8.0573481745636357, rotationY: -0.27507265056992036, theta: 1.8458689773648169 },
  { number: 19, x: -3.1608214936182906, y: 1.4434187455163781, z: 7.6952399816492463, rotationY: -0.38973931612167001, theta: 1.9605356429165666 },
  { number: 20, x: -4.0001953299409658, y: 1.4807017400962690, z: 7.2337494835184346, rotationY: -0.50513634260050111, theta: 2.0759326693953977 },
  { number: 21, x: -4.7806230187255672, y: 1.5182237282311593, z: 6.6784082415483192, rotationY: -0.62127309360804261, theta: 2.1920694204029392 },
  { number: 22, x: -5.4911821794537765, y: 1.5559877937088551, z: 6.0361267068903821, rotationY: -0.73815911397692302, theta: 2.3089554407718196 },
  { number: 23, x: -6.1216982742837898, y: 1.5939970803909516, z: 5.3151432051757519, rotationY: -0.85580413447806869, theta: 2.4266004612729652 },
  { number: 24, x: -6.6629118792089734, y: 1.6322547937833887, z: 4.5249516558491871, rotationY: -0.97421807668183646, theta: 2.5450144034767330 },
  { number: 25, x: -7.1066404739226714, y: 1.6707642026586706, z: 3.6762078231424913, rotationY: -1.0934110579790501, theta: 2.6642073847739467 },
  { number: 26, x: -7.4459320054392979, y: 1.7095286407318022, z: 2.7806142097080677, rotationY: -1.2133933967682982, theta: 2.7841897235631947 },
  { number: 27, x: -7.6752074047662715, y: 1.7485515083920879, z: 1.8507840437703029, rotationY: -1.3341756178161410, theta: 2.9049719446110376 },
  { number: 28, x: -7.7903891992259204, y: 1.7878362744930467, z: 0.90008517325205617, rotationY: -1.4557684577971912, theta: 3.0265647845920878 },
  { number: 29, x: -7.7890133700463577, y: 1.8273864782027958, z: -0.057534938130741953, rotationY: -1.5781828710213563, theta: 3.1489791978162529 },
  { number: 30, x: -7.6703216599956345, y: 1.8672057309173731, z: -1.0077415219604879, rotationY: -1.7014300353558900, theta: 3.2722263621507865 },
  { number: 31, x: -7.4353316431946901, y: 1.9072977182395845, z: -1.9360201278076266, rotationY: -1.8255213583502492, theta: 3.3963176851451458 },
  { number: 32, x: -7.0868820324068720, y: 1.9476662020260871, z: -2.8278971545437193, rotationY: -1.9504684835721560, theta: 3.5212648103670525 },
  { number: 33, x: -6.6296509210507200, y: 1.9883150225055515, z: -3.6691704843153214, rotationY: -2.0762832971636591, theta: 3.6470796239585557 },
  { number: 34, x: -6.0701449401517493, y: 2.0292481004708862, z: -4.4461470224468895, rotationY: -2.2029779346264315, theta: 3.7737742614213281 },
  { number: 35, x: -5.4166576557723447, y: 2.0704694395486527, z: -5.1458835765300934, rotationY: -2.3305647878459839, theta: 3.9013611146408804 },
  { number: 36, x: -4.6791959404188006, y: 2.1119831285489568, z: -5.7564271678929329, rotationY: -2.4590565123649659, theta: 4.0298528391598625 },
  { number: 37, x: -3.8693735216001746, y: 2.1537933438992631, z: -6.2670505682615723, rotationY: -2.5884660349162267, theta: 4.1592623617111233 },
  { number: 38, x: -3.0002714398305566, y: 2.1959043521657584, z: -6.6684786038899571, rotationY: -2.7188065612268488, theta: 4.2896028880217454 },
  { number: 39, x: -2.0862657331542871, y: 2.2383205126660690, z: -6.9531005791612399, rotationY: -2.8500915841049395, theta: 4.4208879108998360 },
  { number: 40, x: -1.1428233003342163, y: 2.2810462801773310, z: -7.1151640521646948, rotationY: -2.9823348918215560, theta: 4.5531312186164525 },
  { number: 41, x: -0.18626757303425470, y: 2.3240862077438229, z: -7.1509451563866060, rotationY: -3.1155505768007945, theta: 4.6863469035956911 },
  { number: 42, x: 0.76648366032957005, y: 2.3674449495885850, z: -7.0588907153987570, rotationY: -3.2497530446317313, theta: 4.8205493714266279 },
  { number: 43, x: 1.6982052007825061, y: 2.4111272641336812, z: -6.8397275505888642, rotationY: -3.3849570234166304, theta: 4.9557533502115270 },
  { number: 44, x: 2.5916723306740326, y: 2.4551380171340034, z: -6.4965346438770020, rotationY: -3.5211775734705890, theta: 5.0919739002654856 },
  { number: 45, x: 3.4299850851096183, y: 2.4994821849297826, z: -6.0347741950051148, rotationY: -3.6584300973885924, theta: 5.2292264241834889 },
  { number: 46, x: 4.1969036158854411, y: 2.5441648578232394, z: -5.4622781116959498, rotationY: -3.7967303504968095, theta: 5.3675266772917061 },
  { number: 47, x: 4.8771886791988894, y: 2.5891912435851077, z: -4.7891870940152543, rotationY: -3.9360944517058591, theta: 5.5068907785007557 },
  { number: 48, x: 5.4569406558569593, y: 2.6345666710970681, z: -4.0278402224466268, rotationY: -4.0765388947847461, theta: 5.6473352215796426 },
  { number: 49, x: 5.9239299705022628, y: 2.6802965941364656, z: -3.1926138304649627, rotationY: -4.2180805600751867, theta: 5.7888768868700833 },
  { number: 50, x: 6.2679113367223751, y: 2.7263865953100317, z: -2.2997094315017512, rotationY: -4.3607367266671275, theta: 5.9315330534620241 },
  { number: 51, x: 6.4809139405718863, y: 2.7728423901437051, z: -1.3668915682613998, rotationY: -4.5045250850574172, theta: 6.0753214118523138 },
  { number: 52, x: 6.5574995088574894, y: 2.8196698313360482, z: -0.41317764656539441, rotationY: -4.6494637503148288, theta: 6.2202600771097254 },
  { number: 53, x: 6.4949802128358369, y: 2.8668749131831683, z: 0.54151691075637753, rotationY: -4.7955712757759290, theta: 6.3663676025708256 },
  { number: 54, x: 6.2935885538766296, y: 2.9144637761835170, z: 1.4767735234036921, rotationY: -4.9428666672976886, theta: 6.5136629940925852 },
  { number: 55, x: 5.9565917843130860, y: 2.9624427118314096, z: 2.3720992974131754, rotationY: -5.0913693980942165, theta: 6.6621657248891131 },
  { number: 56, x: 5.4903440504957688, y: 3.0108181676086234, z: 3.2073824604205465, rotationY: -5.2410994241865838, theta: 6.8118957509814804 },
  { number: 57, x: 4.9042703186182726, y: 3.0595967521839809, z: 3.9633656659855587, rotationY: -5.3920772004963879, theta: 6.9628735272912845 },
  { number: 58, x: 4.2107772651339648, y: 3.1087852408313998, z: 4.6221271883908797, rotationY: -5.5443236976155177, theta: 7.1151200244104142 },
  { number: 59, x: 3.4250876847672469, y: 3.1583905810775259, z: 5.1675588895915983, rotationY: -5.6978604192865046, theta: 7.2686567460814011 },
  { number: 60, x: 2.5649965857510795, y: 3.2084198985907126, z: 5.5858288629360224, rotationY: -5.8527094206298926, theta: 7.4235057474247892 },
  { number: 61, x: 1.6505489917790510, y: 3.2588805033238408, z: 5.8658158923985741, rotationY: -6.0088933271572760, theta: 7.5796896539521725 },
  { number: 62, x: 0.70364153235960225, y: 3.3097798959242137, z: 5.9995023610499629, rotationY: -6.1664353546109840, theta: 7.7372316814058806 },
  { number: 63, x: -0.25244785259677277, y: 3.3611257744245897, z: 5.9823120478811473, rotationY: -6.3253593296739350, theta: 7.8961556564688316 },
  { number: 64, x: -1.1935953826409009, y: 3.4129260412302789, z: 5.8133794157025749, rotationY: -6.4856897115958514, theta: 8.0564860383907480 },
  { number: 65, x: -2.0954228942420978, y: 3.4651888104181618, z: 5.4957375588910580, rotationY: -6.6474516147849272, theta: 8.2182479415798237 },
  { number: 66, x: -2.9339335955704504, y: 3.5179224153644939, z: 5.0364129868308831, rotationY: -6.8106708324171468, theta: 8.3814671592120433 },
  { number: 67, x: -3.6861779700036497, y: 3.5711354167194291, z: 4.4464168976248404, rotationY: -6.9753738611187508, theta: 8.5461701879136474 },
  { number: 68, x: -4.3309333496920122, y: 3.6248366107473453, z: 3.7406245672494229, rotationY: -7.1415879267809199, theta: 8.7123842535758165 },
  { number: 69, x: -4.8493785711219202, y: 3.6790350380532977, z: 2.9375369490034728, rotationY: -7.3093410115695914, theta: 8.8801373383644879 },
  { number: 70, x: -5.2257433359658885, y: 3.7337399927172497, z: 2.0589215384103809, rotationY: -7.4786618821974091, theta: 9.0494582089923057 },
  { number: 71, x: -5.4479105381623834, y: 3.7889610318591638, z: 1.1293329829941849, rotationY: -7.6495801195292632, theta: 9.2203764463241598 },
  { number: 72, x: -5.5079489903647278, y: 3.8447079856595723, z: 0.17551775718981022, rotationY: -7.8221261495976098, theta: 9.3929224763925063 },
  { number: 73, x: -5.4025537970167674, y: 3.9009909678619077, z: -0.77428859013303664, rotationY: -7.9963312761089220, theta: 9.5671276029038186 },
  { number: 74, x: -5.1333721796429774, y: 3.9578203867846540, z: -1.6911586691768392, rotationY: -8.1722277145281108, theta: 9.7430240413230074 },
  { number: 75, x: -4.7071939547445627, y: 4.0152069568733095, z: -2.5463474471774172, rotationY: -8.3498486278337616, theta: 9.9206449546286581 },
  { number: 76, x: -4.1359881726126737, y: 4.0731617108242295, z: -3.3122213388113537, rotationY: -8.5292281640434293, theta: 10.100024490838326 },
  { number: 77, x: -3.4367707012725002, y: 4.1316960123146584, z: -3.9632157475659677, rotationY: -8.7104014956151943, theta: 10.281197822410091 },
  { number: 78, x: -2.6312918101690674, y: 4.1908215693756974, z: -4.4767906272127727, rotationY: -8.8934048608391993, theta: 10.464201187634096 },
  { number: 79, x: -1.7455380644477130, y: 4.2505504484475631, z: -4.8343502368655837, rotationY: -9.0782756073410003, theta: 10.649071934135897 },
  { number: 80, x: -0.80904903218974267, y: 4.3108950891593452, z: -5.0220906890714883, rotationY: -9.2650522378273550, theta: 10.835848564622252 },
  { number: 81, x: 0.14594366517137070, y: 4.3718683198785415, z: -5.0317373731785526, rotationY: -9.4537744582146104, theta: 11.024570785009507 },
  { number: 82, x: 1.0855397176629715, y: 4.4334833740789925, z: -4.8611341093816431, rotationY: -9.6444832282901523, theta: 11.215279555085049 },
  { number: 83, x: 1.9753324815312687, y: 4.4957539075794486, z: -4.5146471732649545, rotationY: -9.8372208150686244, theta: 11.408017141863521 },
  { number: 84, x: 2.7816785146793830, y: 4.5586940167089418, z: -4.0033503216617641, rotationY: -10.032030849016758, theta: 11.602827175811655 },
  { number: 85, x: 3.4730342323126400, y: 4.6223182574594075, z: -3.3449618032425388, rotationY: -10.228958383333893, theta: 11.799754710128790 },
  { number: 86, x: 4.0213118950464262, y: 4.6866416656906482, z: -2.5635111498462750, rotationY: -10.428049956489678, theta: 11.998846283284575 },
  { number: 87, x: 4.4032003810237148, y: 4.7516797784577909, z: -1.6887223417465480, rotationY: -10.629353658236083, theta: 12.200149985030979 },
  { number: 88, x: 4.6013908825367178, y: 4.8174486565369241, z: -0.75511065485452555, rotationY: -10.832919199327954, theta: 12.403715526122850 },
  { number: 89, x: 4.6056443138639471, y: 4.8839649082305927, z: 0.19919704520235007, rotationY: -11.038797985204958, theta: 12.609594311999855 },
  { number: 90, x: 4.4136363313333744, y: 4.9512457145414306, z: 1.1338948975671308, rotationY: -11.247043193908135, theta: 12.817839520703032 },
  { number: 91, x: 4.0315179360610944, y: 5.0193088558093706, z: 2.0081449579735740, rotationY: -11.457709858526467, theta: 13.028506185321364 },
  { number: 92, x: 3.4741350851479353, y: 5.0881727399157572, z: 2.7823845222858208, rotationY: -11.670854954493249, theta: 13.241651281288146 },
  { number: 93, x: 2.7648599150733797, y: 5.1578564321662679, z: 3.4202249180571109, rotationY: -11.886537492078682, theta: 13.457333818873579 },
  { number: 94, x: 1.9349992823105850, y: 5.2283796869740131, z: 3.8903589396834488, rotationY: -12.104818614454302, theta: 13.675614941249199 },
  { number: 95, x: 1.0227633706735890, y: 5.2997629814745357, z: 4.1683823593136369, rotationY: -12.325761701736942, theta: 13.896558028531839 },
  { number: 96, x: 0.071797896208865536, y: 5.3720275512158056, z: 4.2384264076791833, rotationY: -12.549432481455170, theta: 14.120228808250067 },
  { number: 97, x: -0.87069251724336194, y: 5.4451954280788417, z: 4.0944938977466458, rotationY: -12.775899145919876, theta: 14.346695472714773 },
  { number: 98, x: -1.7561756976988576, y: 5.5192894805983714, z: 3.7413928537121177, rotationY: -13.005232477023375, theta: 14.576028803818271 },
  { number: 99, x: -2.5372960414863956, y: 5.5943334568681520, z: 3.1951691090228653, rotationY: -13.237505979038458, theta: 14.808302305833354 },
  { number: 100, x: -3.1705416196125560, y: 5.6703520302323449, z: 2.4829541654597014, rotationY: -13.472796020040750, theta: 15.043592346835647 },
  { number: 101, x: -3.6189386060326569, y: 5.7473708479829089, z: 1.6421671866714216, rotationY: -13.711181982635177, theta: 15.281978309430073 },
  { number: 102, x: -3.8546154310782335, y: 5.8254165833034808, z: 0.71904045583303278, rotationY: -13.952746424730863, theta: 15.523542751525760 },
  { number: 103, x: -3.8610634119559650, y: 5.9045169907229793, z: -0.23352444106626200, rotationY: -14.197575251179194, theta: 15.768371577974090 },
  { number: 104, x: -3.6349136507513098, y: 5.9847009653674021, z: -1.1587180701377429, rotationY: -14.445757897167914, theta: 16.016554223962810 },
  { number: 105, x: -3.1870540825501030, y: 6.0659986063263309, z: -1.9991015506513234, rotationY: -14.697387524350921, theta: 16.268183851145817 },
  { number: 106, x: -2.5429278166471057, y: 6.1484412844818648, z: -2.7002500284870452, rotationY: -14.952561230790026, theta: 16.523357557584923 },
  { number: 107, x: -1.7418859645927591, y: 6.2320617151824775, z: -3.2145594079368038, rotationY: -15.211380275892546, theta: 16.782176602687443 },
  { number: 108, x: -0.83551584208433893, y: 6.3168940361830987, z: -3.5049699604813975, rotationY: -15.473950321648728, theta: 17.044746648443624 },
  { number: 109, x: 0.11507144994355729, y: 6.4029738913160825, z: -3.5483259989439566, rotationY: -15.740381691607206, theta: 17.311178018402103 },
  { number: 110, x: 1.0429331021756909, y: 6.4903385204062749, z: -3.3380716748678494, rotationY: -16.010789649177006, theta: 17.581585975971901 },
  { number: 111, x: 1.8798177957531379, y: 6.5790268559978333, z: -2.8859843359599244, rotationY: -16.285294697013015, theta: 17.856091023807910 },
  { number: 112, x: 2.5612783592683410, y: 6.6690796275215698, z: -2.2226735502811783, rotationY: -16.564022899431116, theta: 18.134819226226011 },
  { number: 113, x: 3.0320405183073431, y: 6.7605394736003648, z: -1.3966296194518704, rotationY: -16.847106230011995, theta: 18.417902556806894 },
  { number: 114, x: 3.2512129076290615, y: 6.8534510632677117, z: -0.47169219130494505, rotationY: -17.134682946792573, theta: 18.705479273587471 },
  { number: 115, x: 3.1968626119874632, y: 6.9478612269619520, z: 0.47707302512818817, rotationY: -17.426897997714775, theta: 18.997694324509673 },
  { number: 116, x: 2.8694513870229024, y: 7.0438190982577371, z: 1.3689571752137646, rotationY: -17.723903459307834, theta: 19.294699786102729 },
  { number: 117, x: 2.2936415881898888, y: 7.1413762674084520, z: 2.1243550775431990, rotationY: -18.025859011927437, theta: 19.596655338722336 },
  { number: 118, x: 1.5180475925980206, y: 7.2405869479007041, z: 2.6722096473402508, rotationY: -18.332932455269415, theta: 19.903728782064309 },
  { number: 119, x: 0.61263509454030396, y: 7.3415081573669605, z: 2.9575265404580819, rotationY: -18.645300268324178, theta: 20.216096595119076 }
];

const SIDE_SLOT_LAYOUT: {
  label: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  height: number;
}[] = [
  { label: "A", x: 9.272887932375056, y: 0.793276000000000, z: -0.960000000000000, rotationY: 1.673956436765213, height: 1.346552000000000 },
  { label: "A1", x: 9.178071032098037, y: 0.776552000000000, z: -1.913589558785343, rotationY: 1.776347450376883, height: 1.313104000000000 },
  { label: "A2", x: 8.986554153540164, y: 0.759828000000000, z: -2.852548863776772, rotationY: 1.878160897920117, height: 1.279656000000000 },
  { label: "A3", x: 8.700857351795975, y: 0.743104000000000, z: -3.767262277188704, rotationY: 1.979403261501603, height: 1.246208000000000 },
  { label: "A4", x: 8.324423383165366, y: 0.726380000000000, z: -4.648523168448232, rotationY: 2.080080914666161, height: 1.212760000000000 },
  { label: "A5", x: 7.861557023719350, y: 0.709656000000000, z: -5.487616741594728, rotationY: 2.180200124808565, height: 1.179312000000000 },
  { label: "A6", x: 7.317357867534879, y: 0.692932000000000, z: -6.276394637843520, rotationY: 2.279767055518708, height: 1.145864000000000 },
  { label: "A7", x: 6.697647619946970, y: 0.676208000000000, z: -7.007340942463136, rotationY: 2.378787768862349, height: 1.112416000000000 },
  { label: "A8", x: 6.008892898873751, y: 0.659484000000000, z: -7.673629337530860, rotationY: 2.477268227599530, height: 1.078968000000000 },
  { label: "A9", x: 5.258124544264665, y: 0.642760000000000, z: -8.269171249506913, rotationY: 2.575214297342695, height: 1.045520000000000 },
  { label: "A10", x: 4.452854412998911, y: 0.626036000000000, z: -8.788654942122774, rotationY: 2.672631748656505, height: 1.012072000000000 },
  { label: "A11", x: 3.600990605138271, y: 0.609312000000000, z: -9.227575600168976, rotationY: 2.769526259101163, height: 0.978624000000000 },
  { label: "A12", x: 2.710752028335861, y: 0.592588000000000, z: -9.582256537879697, rotationY: 2.865903415221138, height: 0.945176000000000 },
  { label: "A13", x: 1.790583161441652, y: 0.575864000000000, z: -9.849861746351381, rotationY: 2.961768714480974, height: 0.911728000000000 },
  { label: "A14", x: 0.849069826923999, y: 0.559140000000000, z: -10.028400067526409, rotationY: 3.057127567149890, height: 0.878280000000000 },
  { label: "A15", x: -0.105143274378671, y: 0.542416000000000, z: -10.116721347549481, rotationY: 3.151985298136788, height: 0.844832000000000 },
  { label: "A16", x: -1.063432572511576, y: 0.525692000000000, z: -10.114504979694166, rotationY: 3.246347148777218, height: 0.811384000000000 },
  { label: "A17", x: -2.017272550694775, y: 0.508968000000000, z: -10.022241296578754, rotationY: 3.340218278573820, height: 0.777936000000000 },
  { label: "A18", x: -2.958309014374850, y: 0.492244000000000, z: -9.841206313144463, rotationY: 3.433603766891659, height: 0.744488000000000 },
  { label: "A19", x: -3.878428206649811, y: 0.475520000000000, z: -9.573430356027671, rotationY: 3.526508614609884, height: 0.711040000000000 },
  { label: "A20", x: -4.769821336022971, y: 0.458796000000000, z: -9.221661141756634, rotationY: 3.618937745731029, height: 0.677592000000000 },
  { label: "A21", x: -5.625044148555935, y: 0.442072000000000, z: -8.789321885933433, rotationY: 3.710896008949269, height: 0.644144000000000 },
  { label: "A22", x: -6.437071241751854, y: 0.425348000000000, z: -8.280465038560504, rotationY: 3.802388179178865, height: 0.610696000000000 },
  { label: "A23", x: -7.199344881345060, y: 0.408624000000000, z: -7.699722247314788, rotationY: 3.893418959044030, height: 0.577248000000000 },
  { label: "A24", x: -7.905818144099823, y: 0.391900000000000, z: -7.052251151268644, rotationY: 3.983992980331352, height: 0.543800000000000 },
  { label: "A25", x: -8.550992269289214, y: 0.375176000000000, z: -6.343679602736929, rotationY: 4.074114805405905, height: 0.510352000000000 },
  { label: "A26", x: -9.129948158351896, y: 0.358452000000000, z: -5.580047905043473, rotationY: 4.163788928592166, height: 0.476904000000000 },
  { label: "A27", x: -9.638372015986715, y: 0.341728000000000, z: -4.767749639509031, rotationY: 4.253019777520712, height: 0.443456000000000 },
  { label: "A28", x: -10.072575176374293, y: 0.325004000000000, z: -3.913471636332116, rotationY: 4.341811714441789, height: 0.410008000000000 },
  { label: "A29", x: -10.429508205095527, y: 0.308280000000000, z: -3.024133621733383, rotationY: 4.430169037506674, height: 0.376560000000000 },
  { label: "A30", x: -10.706769410485164, y: 0.291556000000000, z: -2.106828048225617, rotationY: 4.518095982017779, height: 0.343112000000000 }
];

const CROWN_SLOT_POSITION = { x: 0, y: 8.72150815736696, z: 0, rotationY: 0 };

function BronzeTowerModel() {
  const dims = useMemo(() => {
    const posterWidth = 0.92;
    const posterHeight = 1.38;
    // Slotların konumları SPIRAL_SLOT_LAYOUT içinde sabit koordinatlar olarak tutulur.
    // Duvar ve diğer mimari parçalar aynı koordinat kaynağını kullanır.
    const slots: THREE.Matrix4[] = [];
    const slotCenters: THREE.Vector3[] = [];
    const slotLabels: { position: THREE.Vector3; rotation: THREE.Euler; number: number | string }[] = [];
    const aSlotLayout = SIDE_SLOT_LAYOUT[0];
    const aSlotPosition = new THREE.Vector3(aSlotLayout.x, aSlotLayout.y, aSlotLayout.z);
    const descendingSideSlots = SIDE_SLOT_LAYOUT.slice(1).map((slot) => ({
      position: new THREE.Vector3(slot.x, slot.y, slot.z),
      height: slot.height,
      rotationY: slot.rotationY
    }));

    for (const slot of SIDE_SLOT_LAYOUT) {
      const position = new THREE.Vector3(slot.x, slot.y, slot.z);
      const frontNormal = new THREE.Vector3(Math.cos(Math.PI * 0.5 - slot.rotationY), 0, Math.sin(Math.PI * 0.5 - slot.rotationY));
      slotLabels.push({
        position: position.clone().addScaledVector(frontNormal, 0.045),
        rotation: new THREE.Euler(0, slot.rotationY, 0),
        number: slot.label
      });
    }

    for (const layout of SPIRAL_SLOT_LAYOUT) {
      const slotCenter = new THREE.Vector3(layout.x, layout.y, layout.z);
      slotCenters.push(slotCenter.clone());
      const slotRotation = new THREE.Euler(0, layout.rotationY, 0);
      slots.push(new THREE.Matrix4().compose(
        slotCenter,
        new THREE.Quaternion().setFromEuler(slotRotation),
        new THREE.Vector3(1, 1, 1)
      ));

      const frontNormal = new THREE.Vector3(Math.cos(layout.theta), 0, Math.sin(layout.theta));
      slotLabels.push({
        position: slotCenter.clone().addScaledVector(frontNormal, 0.045),
        rotation: slotRotation.clone(),
        number: layout.number
      });
    }

    // Kırmızı kılavuz çizgisi: A30 -> ... -> A -> 1 -> ... -> 119.
    // Her slotun gerçek yüksekliği ve dönüş açısı hesaba katılır.
    const getSlotUpperLeft = (slot: {
      x: number; y: number; z: number; rotationY: number; height?: number;
    }) => new THREE.Vector3(
      -posterWidth * 0.5,
      (slot.height ?? posterHeight) * 0.5,
      0.075 * 0.5
    ).applyQuaternion(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, slot.rotationY, 0))
    ).add(new THREE.Vector3(slot.x, slot.y, slot.z));

    const crownLowerLeftGuidePoint = new THREE.Vector3(
      -posterWidth * 0.5,
      -posterHeight * 0.5,
      0.075 * 0.5
    ).add(new THREE.Vector3(
      CROWN_SLOT_POSITION.x,
      CROWN_SLOT_POSITION.y,
      CROWN_SLOT_POSITION.z
    ));
    const crownLowerRightGuidePoint = new THREE.Vector3(
      posterWidth * 0.5,
      -posterHeight * 0.5,
      0.075 * 0.5
    ).add(new THREE.Vector3(
      CROWN_SLOT_POSITION.x,
      CROWN_SLOT_POSITION.y,
      CROWN_SLOT_POSITION.z
    ));

    // 120-S2, 120. slotun ön sağ alt köşesine yerleştirilir;
    // böylece 120-S1 -> 120-S2, alt kenar boyunca uzanır.
    const slot118Layout = SPIRAL_SLOT_LAYOUT.find((slot) => slot.number === 118);
    const slot119Layout = SPIRAL_SLOT_LAYOUT.find((slot) => slot.number === 119);
    if (!slot118Layout || !slot119Layout) {
      throw new Error("118 veya 119. slot yerleşimi bulunamadı.");
    }
    const slot118UpperLeftGuidePoint = getSlotUpperLeft(slot118Layout);
    const slot119UpperLeftGuidePoint = getSlotUpperLeft(slot119Layout);
    const crownWallMatchPoint = crownLowerRightGuidePoint.clone();
    crownWallMatchPoint.y = slot118UpperLeftGuidePoint.y;

    const wallGuideLinePoints = [
      ...SIDE_SLOT_LAYOUT.slice().reverse().map(getSlotUpperLeft),
      ...SPIRAL_SLOT_LAYOUT.map(getSlotUpperLeft),
      crownLowerLeftGuidePoint
    ];
    const wallGuideLineGeometry = new THREE.BufferGeometry().setFromPoints(
      wallGuideLinePoints
    );
    const wallGuideLine = new THREE.Line(
      wallGuideLineGeometry,
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    wallGuideLine.renderOrder = 10;

    // Dört kenarlı kırmızı panel: 119-SÜ, 118-SÜ, 120-S2, 120-S1.
    const crownPanelVertices = [
      slot119UpperLeftGuidePoint,
      slot118UpperLeftGuidePoint,
      crownWallMatchPoint,
      crownLowerLeftGuidePoint
    ];
    const crownPanelGeometry = new THREE.BufferGeometry();
    crownPanelGeometry.setAttribute("position", new THREE.Float32BufferAttribute(
      crownPanelVertices.flatMap((point) => [point.x, point.y, point.z]),
      3
    ));
    crownPanelGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    crownPanelGeometry.computeVertexNormals();

    // Dikdörtgenin eksik kenarı: 119-SÜ -> 120-S1.
    const crownPanelConnectorGeometry = new THREE.BufferGeometry().setFromPoints([
      slot119UpperLeftGuidePoint,
      crownLowerLeftGuidePoint
    ]);
    const crownPanelConnectorLine = new THREE.Line(
      crownPanelConnectorGeometry,
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    crownPanelConnectorLine.renderOrder = 12;

    // 120-S1 -> 120-S2 kenarı.
    const crownPanelBaseEdgeGeometry = new THREE.BufferGeometry().setFromPoints([
      crownLowerLeftGuidePoint,
      crownWallMatchPoint
    ]);
    const crownPanelBaseEdgeLine = new THREE.Line(
      crownPanelBaseEdgeGeometry,
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    crownPanelBaseEdgeLine.renderOrder = 12;

    const slot118ToCrownGuideGeometry = new THREE.BufferGeometry().setFromPoints([
      slot118UpperLeftGuidePoint,
      crownWallMatchPoint
    ]);
    const slot118ToCrownGuideLine = new THREE.Line(
      slot118ToCrownGuideGeometry,
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    slot118ToCrownGuideLine.renderOrder = 11;

    // Her köşe noktası 3D görünümde isimlendirilir.
    // Slot köşeleri: <slot adı>-SÜ; 120. duvar noktaları: 120-S1 / 120-S2.
    const wallGuideLabels = [
      ...SIDE_SLOT_LAYOUT.slice().reverse().map((slot) => ({
        name: `${slot.label}-SÜ`,
        position: getSlotUpperLeft(slot)
      })),
      ...SPIRAL_SLOT_LAYOUT.map((slot) => ({
        name: `${slot.number}-SÜ`,
        position: getSlotUpperLeft(slot)
      })),
      // Her SÜ noktasından y=0 tabanına indirilen dikmenin alt ucunu
      // kaynak noktasıyla eşleştirmek için -0 ekiyle etiketle.
      ...[...SIDE_SLOT_LAYOUT, ...SPIRAL_SLOT_LAYOUT].map((slot) => {
        const basePosition = getSlotUpperLeft(slot);
        basePosition.y = 0;
        const slotName = "label" in slot ? slot.label : String(slot.number);
        return {
          name: `${slotName}-SÜ-0`,
          position: basePosition
        };
      }),
      { name: "120-S1", position: crownLowerLeftGuidePoint },
      { name: "120-S2", position: crownWallMatchPoint }
    ];

    // Tek parça spiral duvarın alt ucu A30-120 sağ bağlantısına,
    // üst ucu 119-120 sol bağlantısına oturur.
    // İzlenen hat: A30 -> A29 ... -> A -> 1 -> 2 ... -> 119.
    const wallPositions: number[] = [];
    const wallIndices: number[] = [];
    const wallInset = 0.085;
    const firstSlotBaseY = slotCenters[0].y - posterHeight * 0.5 - 0.025;

    // 120-S1–120-S2 üst kenarından ortak tabana inen kapalı dikey duvar.
    const crownS1S2BaseLeft = crownLowerLeftGuidePoint.clone();
    crownS1S2BaseLeft.y = firstSlotBaseY;
    const crownS1S2BaseRight = crownWallMatchPoint.clone();
    crownS1S2BaseRight.y = firstSlotBaseY;
    const crownS1S2ToBaseWallGeometry = new THREE.BufferGeometry();
    crownS1S2ToBaseWallGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      crownLowerLeftGuidePoint.x, crownLowerLeftGuidePoint.y, crownLowerLeftGuidePoint.z,
      crownWallMatchPoint.x, crownWallMatchPoint.y, crownWallMatchPoint.z,
      crownS1S2BaseRight.x, crownS1S2BaseRight.y, crownS1S2BaseRight.z,
      crownS1S2BaseLeft.x, crownS1S2BaseLeft.y, crownS1S2BaseLeft.z
    ], 3));
    crownS1S2ToBaseWallGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    crownS1S2ToBaseWallGeometry.computeVertexNormals();

    // 120-S2 noktasından ortak taban seviyesine dikey kırmızı referans çizgisi.
    // Diğer slot köşeleri ileride bu düşey hat üzerindeki noktalara bağlanacaktır.
    const crownS2BasePoint = crownWallMatchPoint.clone();
    crownS2BasePoint.y = firstSlotBaseY;
    const crownS2VerticalGuideGeometry = new THREE.BufferGeometry().setFromPoints([
      crownWallMatchPoint,
      crownS2BasePoint
    ]);
    const crownS2VerticalGuideLine = new THREE.Line(
      crownS2VerticalGuideGeometry,
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    crownS2VerticalGuideLine.renderOrder = 13;

    
    // Her SÜ köşesini, 120-S2'nin düşey referans hattına kendi yüksekliğinde
    // yatay (düşey hatta 90 derece) kırmızı çizgiyle bağla.
    // 118-SÜ bağlantısı slot118ToCrownGuideLine ile zaten çizildi.
    const slotToCrownS2HorizontalGuideLines: THREE.Line[] = [];
    const horizontalConnectorSlots = [
      ...SIDE_SLOT_LAYOUT,
      ...SPIRAL_SLOT_LAYOUT.filter((slot) => slot.number !== 118)
    ];

    for (const slot of horizontalConnectorSlots) {
      const slotUpperLeft = getSlotUpperLeft(slot);
      const crownS2AtSlotHeight = crownWallMatchPoint.clone();
      crownS2AtSlotHeight.y = slotUpperLeft.y;

      const connectorGeometry = new THREE.BufferGeometry().setFromPoints([
        slotUpperLeft,
        crownS2AtSlotHeight
      ]);
      const connectorLine = new THREE.Line(
        connectorGeometry,
        new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
      );
      connectorLine.renderOrder = 12;
      slotToCrownS2HorizontalGuideLines.push(connectorLine);
    }

    // Her SÜ noktasından aynı X/Z koordinatını koruyarak y=0 tabanına
    // tam dikey kırmızı bir izdüşüm çizgisi indir.
    const slotUpperLeftToBaseGuideLines: THREE.Line[] = [];
    const allUpperLeftSlots = [...SIDE_SLOT_LAYOUT, ...SPIRAL_SLOT_LAYOUT];

    for (const slot of allUpperLeftSlots) {
      const slotUpperLeft = getSlotUpperLeft(slot);
      const basePoint = slotUpperLeft.clone();
      basePoint.y = 0;

      const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
        slotUpperLeft,
        basePoint
      ]);
      const verticalLine = new THREE.Line(
        verticalGeometry,
        new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
      );
      verticalLine.renderOrder = 14;
      slotUpperLeftToBaseGuideLines.push(verticalLine);
    }

    // Komşu SÜ noktaları ile bunların y=0 izdüşümleri arasındaki
    // ön yüzeyleri dörtgen paneller halinde doldur:
    // A30-SÜ-0 → A29-SÜ-0 → A29-SÜ → A30-SÜ ve aynı düzen tüm hat boyunca.
    const slotFrontFacePanels: THREE.Mesh[] = [];
    // Deneme 8: Bütün duvarlar ve bütün üst yüzeyler için iki sabit ortak materyal.
    const wallBlueMaterial = new THREE.MeshBasicMaterial({
      color: 0x1565ff,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    const topGreenMaterial = new THREE.MeshBasicMaterial({
      color: 0x00c853,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: true
    });

    // Eski materyal adları aynı ortak materyallere yönlendirilir.
    const slotFrontFaceMaterial = wallBlueMaterial;
    const slotSideFaceMaterial = wallBlueMaterial;
    const a30A29EnclosedFaceMaterial = wallBlueMaterial;
    const frontFaceSlotsInPathOrder = [
      ...SIDE_SLOT_LAYOUT.slice().reverse(),
      ...SPIRAL_SLOT_LAYOUT
    ];
    const frontFacePoints = frontFaceSlotsInPathOrder.map((slot) => {
      const upperPoint = getSlotUpperLeft(slot);
      const basePoint = upperPoint.clone();
      basePoint.y = 0;
      return { upperPoint, basePoint };
    });

    // Deneme 6.2: A30-SÜ'den 118-SÜ'ye kadar mevcut ön yüzey panelleri
    // sabit olarak mavi materyalle ve %100 opaklıkta renklendirilir.
    const lastBlueFrontFaceIndex = 149; // A30...A, ardından 1-SÜ...119-SÜ
    const blueFrontFaceMaterial = wallBlueMaterial;
    for (let i = 1; i < frontFacePoints.length; i++) {
      if (i > lastBlueFrontFaceIndex) continue;
      const previous = frontFacePoints[i - 1];
      const current = frontFacePoints[i];
      const panelGeometry = new THREE.BufferGeometry();
      panelGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
        previous.basePoint.x, previous.basePoint.y, previous.basePoint.z,
        current.basePoint.x, current.basePoint.y, current.basePoint.z,
        current.upperPoint.x, current.upperPoint.y, current.upperPoint.z,
        previous.upperPoint.x, previous.upperPoint.y, previous.upperPoint.z
      ], 3));
      panelGeometry.setIndex([0, 1, 2, 0, 2, 3]);
      panelGeometry.computeVertexNormals();

      const panelMesh = new THREE.Mesh(panelGeometry, blueFrontFaceMaterial);
      panelMesh.renderOrder = 10;
      slotFrontFacePanels.push(panelMesh);
    }


    // Yan yüzeyleri aynı dörtgen mantığıyla tüm SÜ noktalarından
    // 120-S2 düşey hattına kadar doldur:
    // Her panel: SÜ-0 → SÜ → 120[SÜ yüksekliği] → 120-S2-0.
    const slotSideFacePanels: THREE.Mesh[] = [];
    const sideFaceSlots = [...SIDE_SLOT_LAYOUT, ...SPIRAL_SLOT_LAYOUT];

    const crownS2AtZeroHeight = crownWallMatchPoint.clone();
    crownS2AtZeroHeight.y = 0;

    for (const slot of sideFaceSlots) {
      // 119-SÜ ile 120-S2 arasındaki eski tabanlı dikdörtgen kaldırılır;
      // bu alanın yerine 120-S1 bağlantılı yeni duvar oluşturulur.
      if ("number" in slot && slot.number === 119) continue;

      const slotUpperPoint = getSlotUpperLeft(slot);
      const slotBasePoint = slotUpperPoint.clone();
      slotBasePoint.y = 0;

      const crownS2AtSlotHeight = crownWallMatchPoint.clone();
      crownS2AtSlotHeight.y = slotUpperPoint.y;

      const sideFaceGeometry = new THREE.BufferGeometry();
      sideFaceGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
        slotBasePoint.x, slotBasePoint.y, slotBasePoint.z,
        slotUpperPoint.x, slotUpperPoint.y, slotUpperPoint.z,
        crownS2AtSlotHeight.x, crownS2AtSlotHeight.y, crownS2AtSlotHeight.z,
        crownS2AtZeroHeight.x, crownS2AtZeroHeight.y, crownS2AtZeroHeight.z
      ], 3));
      sideFaceGeometry.setIndex([0, 1, 2, 0, 2, 3]);
      sideFaceGeometry.computeVertexNormals();

      const sideFacePanel = new THREE.Mesh(
        sideFaceGeometry,
        slotSideFaceMaterial
      );
      sideFacePanel.renderOrder = 6;
      slotSideFacePanels.push(sideFacePanel);
    }

    // Yeni 119-120 duvarı: 120-S1 → 119-SÜ → 119-SÜ-0 → 120-S1-0.
    // Eski 119-SÜ → 120-S2 → 119-SÜ-0 → 120-S2-0 panelinin yerine geçer.
    const slot119UpperLeft = getSlotUpperLeft(
      SPIRAL_SLOT_LAYOUT.find((slot) => slot.number === 119)!
    );
    const slot119BaseLeft = slot119UpperLeft.clone();
    slot119BaseLeft.y = 0;
    const crownS1AtZeroHeight = crownLowerLeftGuidePoint.clone();
    crownS1AtZeroHeight.y = 0;
    const slot119ToCrownS1WallGeometry = new THREE.BufferGeometry();
    slot119ToCrownS1WallGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      crownLowerLeftGuidePoint.x, crownLowerLeftGuidePoint.y, crownLowerLeftGuidePoint.z,
      slot119UpperLeft.x, slot119UpperLeft.y, slot119UpperLeft.z,
      slot119BaseLeft.x, slot119BaseLeft.y, slot119BaseLeft.z,
      crownS1AtZeroHeight.x, crownS1AtZeroHeight.y, crownS1AtZeroHeight.z
    ], 3));
    slot119ToCrownS1WallGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    slot119ToCrownS1WallGeometry.computeVertexNormals();

    // 119-SÜ–120-S1 duvarı diğer mavi ön duvarlarla aynı materyali kullanır.
    const slot119ToCrownS1WallMaterial = blueFrontFaceMaterial;

    // Taban noktaları arasındaki 0.044 birimlik prizma bağlantıları kaldırıldı.
    // Taban noktaları ve diğer kılavuz çizgileri korunur.
    const slotBaseToBaseGuideLines: THREE.Mesh[] = [];

    // A30-SÜ-0 → 120A30-SÜ-0 ve 119-SÜ-0 → 120-S2-0
    // arasındaki 0.044 birim kare kesitli prizma bağlantıları kaldırıldı.
    const slotBaseToCrownS2GuideLines: THREE.Mesh[] = [];

    type WallPathPoint = {
      x: number; y: number; z: number; halfHeight: number;
      rotationY: number; radialX: number; radialZ: number;
    };

    const wallPath: WallPathPoint[] = [
      ...SIDE_SLOT_LAYOUT.slice().reverse().map((slot) => ({
        x: slot.x, y: slot.y, z: slot.z,
        halfHeight: slot.height * 0.5,
        rotationY: slot.rotationY,
        radialX: slot.x, radialZ: slot.z
      })),
      ...SPIRAL_SLOT_LAYOUT.map((slot) => ({
        x: slot.x, y: slot.y, z: slot.z,
        halfHeight: posterHeight * 0.5,
        rotationY: slot.rotationY,
        radialX: slot.x, radialZ: slot.z
      }))
    ];

    for (let i = 0; i < wallPath.length; i++) {
      const point = wallPath[i];
      const radial = new THREE.Vector3(point.radialX, 0, point.radialZ).normalize();
      const center = new THREE.Vector3(point.x, point.y, point.z)
        .addScaledVector(radial, -wallInset);

      const top = center.clone();
      const bottom = center.clone();
      top.y += point.halfHeight;
      bottom.y = firstSlotBaseY;

      // Alt/üst uçları mevcut bağlantı panellerinin gerçek kenarlarına hizala.
      if (i === 0) {
        const a30 = SIDE_SLOT_LAYOUT[SIDE_SLOT_LAYOUT.length - 1];
        const a30Rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a30.rotationY, 0));
        top.copy(new THREE.Vector3(posterWidth * 0.5, a30.height * 0.5, 0.075 * 0.5)
          .applyQuaternion(a30Rotation)
          .add(new THREE.Vector3(a30.x, a30.y, a30.z)));
      } else if (i === wallPath.length - 1) {
        const last = SPIRAL_SLOT_LAYOUT[SPIRAL_SLOT_LAYOUT.length - 1];
        const lastRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, last.rotationY, 0));
        top.copy(new THREE.Vector3(-posterWidth * 0.5, posterHeight * 0.5, 0.075 * 0.5)
          .applyQuaternion(lastRotation)
          .add(new THREE.Vector3(last.x, last.y, last.z)));
      }

      bottom.x = top.x;
      bottom.z = top.z;
      wallPositions.push(
        top.x, top.y, top.z,
        bottom.x, bottom.y, bottom.z
      );

      if (i > 0) {
        const previous = (i - 1) * 2;
        const current = i * 2;
        wallIndices.push(
          previous, previous + 1, current,
          previous + 1, current + 1, current
        );
      }
    }

    const wallGeometry = new THREE.BufferGeometry();
    wallGeometry.setAttribute("position", new THREE.Float32BufferAttribute(wallPositions, 3));
    wallGeometry.setIndex(wallIndices);
    wallGeometry.computeVertexNormals();

    const crownPosition = new THREE.Vector3(
      CROWN_SLOT_POSITION.x,
      CROWN_SLOT_POSITION.y,
      CROWN_SLOT_POSITION.z
    );
    slots.push(new THREE.Matrix4().compose(
      crownPosition,
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ));
    slotLabels.push({
      position: crownPosition.clone().add(new THREE.Vector3(0, 0, 0.045)),
      rotation: new THREE.Euler(0, 0, 0),
      number: 120
    });

    // 120. slotun altından ana duvar tabanına kadar inen, slotla aynı
    // genişlikte ve aynı dikey düzlemde bir destek duvarı.
    const crownWallTopY = crownWallMatchPoint.y - 0.003;
    const crownWallHeight = crownWallTopY - firstSlotBaseY;
    const crownWallGeometry = new THREE.BoxGeometry(posterWidth, crownWallHeight, 0.075);
    const crownWallPosition = new THREE.Vector3(
      0,
      firstSlotBaseY + crownWallHeight * 0.5,
      0
    );

    // 119. slotun dönüşü, 119-120 bağlantı panellerinde kullanılır.
    const lastSpiralLayout = SPIRAL_SLOT_LAYOUT[SPIRAL_SLOT_LAYOUT.length - 1];
    const lastSpiralRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, lastSpiralLayout.rotationY, 0)
    );

    // Bağlantı duvarının üst kenarı tam olarak 119. slotun sol üst
    // köşesinden 120. slotun sol alt köşesine uzanır.
    const lastSpiralUpperLeft = new THREE.Vector3(
      -posterWidth * 0.5,
      posterHeight * 0.5,
      0.075 * 0.5
    ).applyQuaternion(lastSpiralRotation).add(
      new THREE.Vector3(lastSpiralLayout.x, lastSpiralLayout.y, lastSpiralLayout.z)
    );

    const crownLowerLeft = new THREE.Vector3(
      -posterWidth * 0.5,
      -posterHeight * 0.5,
      0.075 * 0.5
    ).add(crownPosition);

    // Sağ bağlantı duvarının üst kenarı 119. slotun sağ üst
    // köşesinden 120. slotun sağ alt köşesine uzanır.
    const lastSpiralUpperRight = new THREE.Vector3(
      posterWidth * 0.5,
      posterHeight * 0.5,
      0.075 * 0.5
    ).applyQuaternion(lastSpiralRotation).add(
      new THREE.Vector3(lastSpiralLayout.x, lastSpiralLayout.y, lastSpiralLayout.z)
    );

    const crownLowerRight = new THREE.Vector3(
      posterWidth * 0.5,
      -posterHeight * 0.5,
      0.075 * 0.5
    ).add(crownPosition);

    const connectorBottomStart = lastSpiralUpperLeft.clone();
    connectorBottomStart.y = firstSlotBaseY;
    const connectorBottomEnd = crownLowerLeft.clone();
    connectorBottomEnd.y = firstSlotBaseY;

    const wallConnectorGeometry = new THREE.BufferGeometry();
    wallConnectorGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      lastSpiralUpperLeft.x, lastSpiralUpperLeft.y, lastSpiralUpperLeft.z,
      connectorBottomStart.x, connectorBottomStart.y, connectorBottomStart.z,
      connectorBottomEnd.x, connectorBottomEnd.y, connectorBottomEnd.z,
      crownLowerLeft.x, crownLowerLeft.y, crownLowerLeft.z
    ], 3));
    wallConnectorGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    wallConnectorGeometry.computeVertexNormals();

    const rightConnectorBottomStart = lastSpiralUpperRight.clone();
    rightConnectorBottomStart.y = firstSlotBaseY;
    const rightConnectorBottomEnd = crownLowerRight.clone();
    rightConnectorBottomEnd.y = firstSlotBaseY;

    const wallRightConnectorGeometry = new THREE.BufferGeometry();
    wallRightConnectorGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      lastSpiralUpperRight.x, lastSpiralUpperRight.y, lastSpiralUpperRight.z,
      rightConnectorBottomStart.x, rightConnectorBottomStart.y, rightConnectorBottomStart.z,
      rightConnectorBottomEnd.x, rightConnectorBottomEnd.y, rightConnectorBottomEnd.z,
      crownLowerRight.x, crownLowerRight.y, crownLowerRight.z
    ], 3));
    wallRightConnectorGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    wallRightConnectorGeometry.computeVertexNormals();

    // İki yan bağlantı duvarının arasını kapatan ön yüzey:
    // 119. slotun üst kenarından 120. slotun alt kenarına uzanır.
    const wallConnectorFillGeometry = new THREE.BufferGeometry();
    wallConnectorFillGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      lastSpiralUpperLeft.x, lastSpiralUpperLeft.y, lastSpiralUpperLeft.z,
      lastSpiralUpperRight.x, lastSpiralUpperRight.y, lastSpiralUpperRight.z,
      crownLowerRight.x, crownLowerRight.y, crownLowerRight.z,
      crownLowerLeft.x, crownLowerLeft.y, crownLowerLeft.z
    ], 3));
    wallConnectorFillGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    wallConnectorFillGeometry.computeVertexNormals();


    // 1-118 arasındaki her slot, kendi tavan yüksekliğinde 120. slotun
    // destek duvarına aynı dikey bağlantı geometrisiyle bağlanır.
    const wallToCrownConnectors: {
      left: THREE.BufferGeometry;
      right: THREE.BufferGeometry;
      fill: THREE.BufferGeometry;
    }[] = [];

    const connectorSlots = [
      ...SPIRAL_SLOT_LAYOUT.filter((item) => item.number >= 1 && item.number <= 118).map((slot) => ({ ...slot, height: posterHeight })),
      ...SIDE_SLOT_LAYOUT
    ];

    for (const slot of connectorSlots) {
      const slotHalfHeight = slot.height * 0.5;
      const slotRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, slot.rotationY, 0)
      );
      const slotPosition = new THREE.Vector3(slot.x, slot.y, slot.z);
      const slotUpperLeft = new THREE.Vector3(
        -posterWidth * 0.5,
        slotHalfHeight,
        0.075 * 0.5
      ).applyQuaternion(slotRotation).add(slotPosition);
      const slotUpperRight = new THREE.Vector3(
        posterWidth * 0.5,
        slotHalfHeight,
        0.075 * 0.5
      ).applyQuaternion(slotRotation).add(slotPosition);

      // Her bağlantı, ilgili slotun tavan yüksekliğinde 120. slotun
      // destek duvarına ulaşır; 120. slotun alt köşeleri kullanılmaz.
      const joinY = slot.y + slotHalfHeight;
      const crownJoinLeft = new THREE.Vector3(-posterWidth * 0.5, joinY, 0.075 * 0.5);
      const crownJoinRight = new THREE.Vector3(posterWidth * 0.5, joinY, 0.075 * 0.5);

      const slotLeftBottom = slotUpperLeft.clone();
      slotLeftBottom.y = firstSlotBaseY;
      const crownLeftBottom = crownJoinLeft.clone();
      crownLeftBottom.y = firstSlotBaseY;
      const left = new THREE.BufferGeometry();
      left.setAttribute("position", new THREE.Float32BufferAttribute([
        slotUpperLeft.x, slotUpperLeft.y, slotUpperLeft.z,
        slotLeftBottom.x, slotLeftBottom.y, slotLeftBottom.z,
        crownLeftBottom.x, crownLeftBottom.y, crownLeftBottom.z,
        crownJoinLeft.x, crownJoinLeft.y, crownJoinLeft.z
      ], 3));
      left.setIndex([0, 1, 2, 0, 2, 3]);
      left.computeVertexNormals();

      const slotRightBottom = slotUpperRight.clone();
      slotRightBottom.y = firstSlotBaseY;
      const crownRightBottom = crownJoinRight.clone();
      crownRightBottom.y = firstSlotBaseY;
      const right = new THREE.BufferGeometry();
      right.setAttribute("position", new THREE.Float32BufferAttribute([
        slotUpperRight.x, slotUpperRight.y, slotUpperRight.z,
        slotRightBottom.x, slotRightBottom.y, slotRightBottom.z,
        crownRightBottom.x, crownRightBottom.y, crownRightBottom.z,
        crownJoinRight.x, crownJoinRight.y, crownJoinRight.z
      ], 3));
      right.setIndex([0, 1, 2, 0, 2, 3]);
      right.computeVertexNormals();

      const fill = new THREE.BufferGeometry();
      fill.setAttribute("position", new THREE.Float32BufferAttribute([
        slotUpperLeft.x, slotUpperLeft.y, slotUpperLeft.z,
        slotUpperRight.x, slotUpperRight.y, slotUpperRight.z,
        crownJoinRight.x, crownJoinRight.y, crownJoinRight.z,
        crownJoinLeft.x, crownJoinLeft.y, crownJoinLeft.z
      ], 3));
      fill.setIndex([0, 1, 2, 0, 2, 3]);
      fill.computeVertexNormals();

      wallToCrownConnectors.push({ left, right, fill });
    }

    // A29-A30 arasındaki sağ kenarı, ortak tabana kadar inen yekpare bir
    // duvarla kapat. Aynı panelin karşılığı 120. slot destek duvarında da oluşur.
    const a29 = SIDE_SLOT_LAYOUT.find((slot) => slot.label === "A29");
    const a30 = SIDE_SLOT_LAYOUT.find((slot) => slot.label === "A30");
    if (!a29 || !a30) throw new Error("A29 veya A30 yerleşimi bulunamadı.");

    const getSideSlotUpperRight = (slot: typeof a29) => new THREE.Vector3(
      posterWidth * 0.5,
      slot.height * 0.5,
      0.075 * 0.5
    ).applyQuaternion(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, slot.rotationY, 0))
    ).add(new THREE.Vector3(slot.x, slot.y, slot.z));

    const a29UpperRight = getSideSlotUpperRight(a29);
    const a30UpperRight = getSideSlotUpperRight(a30);

    // Deneme 9.2: Kırmızı kılavuz, A30-SÜ'den başlayıp hesaplanan A31-SÜ...A44-SÜ
    // noktalarının tamamından geçer. A44-SÜ, Y=0 taban noktasını temsil eder.
    const a30SpiralLinePoints = [
      getSlotUpperLeft(a30),
      new THREE.Vector3(-10.890838, 0.429664, -1.630302), // A31-SÜ
      new THREE.Vector3(-11.044312, 0.396216, -0.678389), // A32-SÜ
      new THREE.Vector3(-11.114468, 0.362768, 0.282966), // A33-SÜ
      new THREE.Vector3(-11.101256, 0.329320, 1.246445), // A34-SÜ
      new THREE.Vector3(-11.005266, 0.295872, 2.204831), // A35-SÜ
      new THREE.Vector3(-10.827707, 0.262424, 3.151063), // A36-SÜ
      new THREE.Vector3(-10.570380, 0.228976, 4.078282), // A37-SÜ
      new THREE.Vector3(-10.235651, 0.195528, 4.979888), // A38-SÜ
      new THREE.Vector3(-9.826415, 0.162080, 5.849575), // A39-SÜ
      new THREE.Vector3(-9.346062, 0.128632, 6.681377), // A40-SÜ
      new THREE.Vector3(-8.798441, 0.095184, 7.469704), // A41-SÜ
      new THREE.Vector3(-8.187811, 0.061736, 8.209371), // A42-SÜ
      new THREE.Vector3(-7.518807, 0.028288, 8.895625), // A43-SÜ
      new THREE.Vector3(-6.796378, 0, 9.524174) // A44-SÜ
    ];

    // A44-SÜ referansında yeni dış kemer ve iç sınır konturları.
    const a44ArchAnchor = a30SpiralLinePoints[a30SpiralLinePoints.length - 1].clone();
    const a44ArchRightDirection = new THREE.Vector3(-6.021561, 0, 10.093715)
      .sub(a44ArchAnchor).setY(0).normalize();
    const createA44ArchContour = (
      leftBottom: THREE.Vector2,
      rightBottom: THREE.Vector2,
      rightSpring: THREE.Vector2,
      center: THREE.Vector2,
      radius: number,
      leftSpring: THREE.Vector2
    ) => {
      const points = [leftBottom, rightBottom, rightSpring];
      for (let i = 1; i <= 32; i++) {
        const angle = (Math.PI * i) / 32;
        points.push(new THREE.Vector2(
          center.x + Math.cos(angle) * radius,
          center.y + Math.sin(angle) * radius
        ));
      }
      points.push(leftSpring, leftBottom);
      return points.map(({ x, y }) =>
        a44ArchAnchor.clone()
          .addScaledVector(a44ArchRightDirection, x)
          .add(new THREE.Vector3(0, y, 0))
      );
    };

    const a44OuterArchPoints = createA44ArchContour(
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.08, 0),
      new THREE.Vector2(1.08, 1.38),
      new THREE.Vector2(0.54, 1.38),
      0.54,
      new THREE.Vector2(0, 1.38)
    );
    const a44InnerArchPoints = createA44ArchContour(
      new THREE.Vector2(0.06, 0.06),
      new THREE.Vector2(1.02, 0.06),
      new THREE.Vector2(1.02, 1.38),
      new THREE.Vector2(0.54, 1.38),
      0.48,
      new THREE.Vector2(0.06, 1.38)
    );
    const a44OuterArchOutline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(a44OuterArchPoints),
      new THREE.LineBasicMaterial({ color: "#ffff00", depthTest: true })
    );
    a44OuterArchOutline.renderOrder = 31;
    const a44InnerArchOutline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(a44InnerArchPoints),
      new THREE.LineBasicMaterial({ color: "#ffff00", depthTest: true })
    );
    a44InnerArchOutline.renderOrder = 32;

    // Kemer açıklığının içine örnek poster: iç konturdan pay bırakılarak yerleştirilir.
    // Poster 0.88 × 1.28 birimdir; altı Y=0.08, üstü Y=1.36 seviyesindedir.
    const a44PosterNormal = new THREE.Vector3()
      .crossVectors(a44ArchRightDirection, new THREE.Vector3(0, 1, 0))
      .normalize();
    const a44PosterQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        a44ArchRightDirection,
        new THREE.Vector3(0, 1, 0),
        a44PosterNormal
      )
    );
    const a44PosterPosition = a44ArchAnchor.clone()
      .addScaledVector(a44ArchRightDirection, 0.54)
      .add(new THREE.Vector3(0, 0.72, 0))
      .addScaledVector(a44PosterNormal, 0.018);

    // Üst kırmızı sınır: A30-SÜ → A31...A44-SÜ.
    const a30SpiralGuideLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(a30SpiralLinePoints),
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    a30SpiralGuideLine.renderOrder = 15;

    // Alt kırmızı sınır: A30-SÜ-0 → A31-SÜ-0 ... A43-SÜ-0 → A44-SÜ.
    // Her taban noktası, ilgili SÜ noktasının Y=0 düzlemine dik izdüşümüdür.
    const a30SpiralBaseLinePoints = [
      a30SpiralLinePoints[0].clone().setY(0),
      new THREE.Vector3(-10.890838, 0, -1.630302), // A31-SÜ0
      new THREE.Vector3(-11.044312, 0, -0.678389), // A32-SÜ0
      new THREE.Vector3(-11.114468, 0, 0.282966), // A33-SÜ0
      new THREE.Vector3(-11.101256, 0, 1.246445), // A34-SÜ0
      new THREE.Vector3(-11.005266, 0, 2.204831), // A35-SÜ0
      new THREE.Vector3(-10.827707, 0, 3.151063), // A36-SÜ0
      new THREE.Vector3(-10.570380, 0, 4.078282), // A37-SÜ0
      new THREE.Vector3(-10.235651, 0, 4.979888), // A38-SÜ0
      new THREE.Vector3(-9.826415, 0, 5.849575), // A39-SÜ0
      new THREE.Vector3(-9.346062, 0, 6.681377), // A40-SÜ0
      new THREE.Vector3(-8.798441, 0, 7.469704), // A41-SÜ0
      new THREE.Vector3(-8.187811, 0, 8.209371), // A42-SÜ0
      new THREE.Vector3(-7.518807, 0, 8.895625), // A43-SÜ0
      a30SpiralLinePoints[a30SpiralLinePoints.length - 1].clone() // A44-SÜ
    ];
    const a30SpiralBottomLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(a30SpiralBaseLinePoints),
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    a30SpiralBottomLine.renderOrder = 16;

    // A44-SÜ'nün 120-S2 dikmesi üzerindeki karşılık noktası.
    // A44-SÜ yüksekliği 0 olduğundan 120'44-SÜ, 120-S2 ekseninin Y=0 izdüşümüdür.
    const a44ToCrownS2BasePoint = crownWallMatchPoint.clone();
    a44ToCrownS2BasePoint.y = 0;
    const a44UpperPoint = a30SpiralLinePoints[a30SpiralLinePoints.length - 1];
    const a44ToCrownS2GuideLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        a44UpperPoint,
        a44ToCrownS2BasePoint
      ]),
      new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
    );
    a44ToCrownS2GuideLine.renderOrder = 17;

    // A31-SÜ ... A43-SÜ noktalarının 120-S2 dikmesi üzerindeki
    // karşılıkları aynı yükseklikte oluşturulur ve her çift kırmızı çizgiyle bağlanır.
    const a31ToA43CrownS2GuideLines = a30SpiralLinePoints.slice(1, -1).map((upperPoint) => {
      const correspondingPoint = crownWallMatchPoint.clone();
      correspondingPoint.y = upperPoint.y;
      const guideLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([upperPoint, correspondingPoint]),
        new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false })
      );
      guideLine.renderOrder = 17;
      return guideLine;
    });

    // Mavi duvar, üst ve alt spiral sınırların ardışık noktaları
    // arasında ayrı dörtgen paneller oluşturularak doldurulur.
    const a30A44WallGeometry = new THREE.BufferGeometry();
    const a30A44WallPositions: number[] = [];
    const a30A44WallIndices: number[] = [];
    for (let i = 0; i < a30SpiralLinePoints.length - 1; i++) {
      const upperStart = a30SpiralLinePoints[i];
      const upperEnd = a30SpiralLinePoints[i + 1];
      const baseEnd = a30SpiralBaseLinePoints[i + 1];
      const baseStart = a30SpiralBaseLinePoints[i];
      const offset = a30A44WallPositions.length / 3;
      a30A44WallPositions.push(
        upperStart.x, upperStart.y, upperStart.z,
        upperEnd.x, upperEnd.y, upperEnd.z,
        baseEnd.x, baseEnd.y, baseEnd.z,
        baseStart.x, baseStart.y, baseStart.z
      );
      a30A44WallIndices.push(
        offset, offset + 1, offset + 2,
        offset, offset + 2, offset + 3
      );
    }
    a30A44WallGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(a30A44WallPositions, 3)
    );
    a30A44WallGeometry.setIndex(a30A44WallIndices);
    a30A44WallGeometry.computeVertexNormals();
    const a29BaseRight = a29UpperRight.clone();
    const a30BaseRight = a30UpperRight.clone();
    a29BaseRight.y = firstSlotBaseY;
    a30BaseRight.y = firstSlotBaseY;

    const sideSeriesRightWallGeometry = new THREE.BufferGeometry();
    sideSeriesRightWallGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      a29UpperRight.x, a29UpperRight.y, a29UpperRight.z,
      a29BaseRight.x, a29BaseRight.y, a29BaseRight.z,
      a30BaseRight.x, a30BaseRight.y, a30BaseRight.z,
      a30UpperRight.x, a30UpperRight.y, a30UpperRight.z
    ], 3));
    sideSeriesRightWallGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    sideSeriesRightWallGeometry.computeVertexNormals();

    const a29CrownJoinRight = new THREE.Vector3(
      posterWidth * 0.5,
      a29.y + a29.height * 0.5,
      0.075 * 0.5
    );
    const a30CrownJoinRight = new THREE.Vector3(
      posterWidth * 0.5,
      a30.y + a30.height * 0.5,
      0.075 * 0.5
    );
    const a29CrownBaseRight = a29CrownJoinRight.clone();
    const a30CrownBaseRight = a30CrownJoinRight.clone();
    a29CrownBaseRight.y = firstSlotBaseY;
    a30CrownBaseRight.y = firstSlotBaseY;

    const crownSeriesRightWallGeometry = new THREE.BufferGeometry();
    crownSeriesRightWallGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      a29CrownJoinRight.x, a29CrownJoinRight.y, a29CrownJoinRight.z,
      a29CrownBaseRight.x, a29CrownBaseRight.y, a29CrownBaseRight.z,
      a30CrownBaseRight.x, a30CrownBaseRight.y, a30CrownBaseRight.z,
      a30CrownJoinRight.x, a30CrownJoinRight.y, a30CrownJoinRight.z
    ], 3));
    crownSeriesRightWallGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    crownSeriesRightWallGeometry.computeVertexNormals();

    // A30-SÜ → A29-SÜ → 120A29-SÜ → 120A30-SÜ
    // dörtgeni ve aynı düzende hat boyunca devam eden tüm komşu alanlar.
    // A30-SÜ'den 118-SÜ'ye kadar tüm üst yüzeyler opak yeşil.
    // Sabit nokta koordinatları ve upperBridgePairHeights değerleri korunur.
    const upperBridgeGreenMaterial = topGreenMaterial;
    const crownPanelMaterial = topGreenMaterial;
    const upperBridgeFacePanels: THREE.Mesh[] = [];
    const upperBridgeSlots = [
      ...SIDE_SLOT_LAYOUT.slice().reverse(),
      ...SPIRAL_SLOT_LAYOUT
    ];

    // Karşılıklı SÜ noktalarının yükseklikleri mevcut yerleşimden alınarak sabitlendi.
    // Sıra: A30...A, ardından 1...119. Her iki uç aynı Y değerini kullanır.
    const upperBridgePairHeights = [
      0.463112,
      0.49656,
      0.530008,
      0.563456,
      0.596904,
      0.630352,
      0.6638,
      0.697248,
      0.730696,
      0.764144,
      0.797592,
      0.83104,
      0.864488,
      0.897936,
      0.931384,
      0.964832,
      0.99828,
      1.031728,
      1.065176,
      1.098624,
      1.132072,
      1.16552,
      1.198968,
      1.232416,
      1.265864,
      1.299312,
      1.33276,
      1.366208,
      1.399656,
      1.433104,
      1.466552,
      1.5,
      1.533448172280245,
      1.567088575435664,
      1.600923431788513,
      1.634955002422483,
      1.6691855880894,
      1.703617530142594,
      1.738253211497877,
      1.773095057623132,
      1.808145537557521,
      1.843407164961393,
      1.878882499198017,
      1.914574146448278,
      1.950484760859584,
      1.986617045730219,
      2.022973754730486,
      2.059557693162004,
      2.096371719256613,
      2.133418745516378,
      2.170701740096269,
      2.208223728231159,
      2.245987793708855,
      2.283997080390952,
      2.322254793783388,
      2.360764202658671,
      2.399528640731802,
      2.438551508392088,
      2.477836274493047,
      2.517386478202796,
      2.557205730917373,
      2.597297718239584,
      2.637666202026087,
      2.678315022505552,
      2.719248100470886,
      2.760469439548653,
      2.801983128548957,
      2.843793343899263,
      2.885904352165758,
      2.928320512666069,
      2.971046280177331,
      3.014086207743823,
      3.057444949588585,
      3.101127264133681,
      3.145138017134003,
      3.189482184929783,
      3.234164857823239,
      3.279191243585108,
      3.324566671097068,
      3.370296594136466,
      3.416386595310032,
      3.462842390143705,
      3.509669831336048,
      3.556874913183168,
      3.604463776183517,
      3.65244271183141,
      3.700818167608623,
      3.749596752183981,
      3.7987852408314,
      3.848390581077526,
      3.898419898590713,
      3.948880503323841,
      3.999779895924214,
      4.051125774424589,
      4.102926041230279,
      4.155188810418162,
      4.207922415364494,
      4.261135416719429,
      4.314836610747346,
      4.369035038053298,
      4.42373999271725,
      4.478961031859164,
      4.534707985659573,
      4.590990967861908,
      4.647820386784653,
      4.70520695687331,
      4.76316171082423,
      4.821696012314659,
      4.880821569375698,
      4.940550448447564,
      5.000895089159345,
      5.061868319878542,
      5.123483374078992,
      5.185753907579448,
      5.248694016708942,
      5.312318257459408,
      5.376641665690649,
      5.441679778457791,
      5.507448656536925,
      5.573964908230593,
      5.64124571454143,
      5.70930885580937,
      5.778172739915757,
      5.847856432166267,
      5.918379686974014,
      5.989762981474536,
      6.062027551215806,
      6.135195428078841,
      6.209289480598372,
      6.284333456868152,
      6.360352030232345,
      6.437370847982908,
      6.51541658330348,
      6.59451699072298,
      6.674700965367402,
      6.755998606326331,
      6.838441284481865,
      6.922061715182478,
      7.006894036183098,
      7.092973891316083,
      7.180338520406275,
      7.269026855997833,
      7.35907962752157,
      7.450539473600365,
      7.543451063267712,
      7.637861226961952,
      7.733819098257737,
      7.831376267408451,
      7.930586947900704,
      8.03150815736696
    ];

    for (let i = 1; i < upperBridgeSlots.length; i++) {
      // 118-SÜ → 119-SÜ aralığının eski kırmızı üst paneli kaldırıldı.
      if (i === 149) continue;
      const previousSlot = upperBridgeSlots[i - 1];
      const currentSlot = upperBridgeSlots[i];
      const previousUpperPoint = getSlotUpperLeft(previousSlot);
      const currentUpperPoint = getSlotUpperLeft(currentSlot);
      const previousPairHeight = upperBridgePairHeights[i - 1];
      const currentPairHeight = upperBridgePairHeights[i];
      // Slot tarafı ve 120 dikmesi tarafındaki karşılıklı noktalar aynı sabit Y değerindedir.
      previousUpperPoint.y = previousPairHeight;
      currentUpperPoint.y = currentPairHeight;
      const points = [
        previousUpperPoint,
        currentUpperPoint,
        new THREE.Vector3(posterWidth * 0.5, currentPairHeight, 0.075 * 0.5),
        new THREE.Vector3(posterWidth * 0.5, previousPairHeight, 0.075 * 0.5)
      ];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(
        points.flatMap((point) => [point.x, point.y, point.z]),
        3
      ));
      geometry.setIndex([0, 1, 2, 0, 2, 3]);
      geometry.computeVertexNormals();

      // Bütün üst köprü panelleri aynı sabit yeşil materyali kullanır.
      const panelMaterial = upperBridgeGreenMaterial;
      const panel = new THREE.Mesh(geometry, panelMaterial);
      panel.renderOrder = 8;
      upperBridgeFacePanels.push(panel);
    }

    // Deneme 5: Kullanıcının belirttiği sekiz noktalı çevrimi doldur.
    // 120A30-SÜ-0 ve 120A29-SÜ-0 aynı koordinatta birleştiği için
    // ortak taban noktası geometride tek vertex olarak tutulur.
    const a30A29EnclosedFaceA30Base = getSlotUpperLeft(a30);
    a30A29EnclosedFaceA30Base.y = 0;
    const a30A29EnclosedFaceA29Base = getSlotUpperLeft(a29);
    a30A29EnclosedFaceA29Base.y = 0;
    const a30A29EnclosedFacePoints = [
      getSlotUpperLeft(a30),
      getSlotUpperLeft(a29),
      a30A29EnclosedFaceA29Base,
      a30A29EnclosedFaceA30Base,
      a30CrownBaseRight.clone(),
      a29CrownJoinRight.clone(),
      a30CrownJoinRight.clone()
    ];
    const a30A29EnclosedFaceGeometry = new THREE.BufferGeometry();
    a30A29EnclosedFaceGeometry.setAttribute("position", new THREE.Float32BufferAttribute(
      a30A29EnclosedFacePoints.flatMap((point) => [point.x, point.y, point.z]),
      3
    ));
    a30A29EnclosedFaceGeometry.setIndex([
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 5,
      0, 5, 6
    ]);
    a30A29EnclosedFaceGeometry.computeVertexNormals();

    // A31-SÜ ... A44-SÜ boyunca her komşu nokta çifti için,
    // A29-SÜ / 120'A29-SÜ / 120'A30-SÜ / A30-SÜ düzenindeki
    // dörtgen yüzeyleri oluştur.
    const a30A44CrownS2FacePanels: THREE.Mesh[] = [];
    const a30ToA44UpperPoints = a30SpiralLinePoints.slice(0);
    for (let i = 0; i < a30ToA44UpperPoints.length - 1; i++) {
      const currentUpperPoint = a30ToA44UpperPoints[i];
      const nextUpperPoint = a30ToA44UpperPoints[i + 1];
      const currentCrownPoint = crownWallMatchPoint.clone();
      const nextCrownPoint = crownWallMatchPoint.clone();
      currentCrownPoint.y = currentUpperPoint.y;
      nextCrownPoint.y = nextUpperPoint.y;

      const panelGeometry = new THREE.BufferGeometry();
      panelGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
        currentUpperPoint.x, currentUpperPoint.y, currentUpperPoint.z,
        currentCrownPoint.x, currentCrownPoint.y, currentCrownPoint.z,
        nextCrownPoint.x, nextCrownPoint.y, nextCrownPoint.z,
        nextUpperPoint.x, nextUpperPoint.y, nextUpperPoint.z
      ], 3));
      panelGeometry.setIndex([0, 1, 2, 0, 2, 3]);
      panelGeometry.computeVertexNormals();

      const panel = new THREE.Mesh(panelGeometry, topGreenMaterial);
      panel.renderOrder = 10;
      a30A44CrownS2FacePanels.push(panel);
    }

    // A30-SÜ-0'dan başlayıp 119-SÜ-0'a kadar tüm komşu taban
    // noktalarını 120-S2 taban noktasına bağlayan yüzeyleri doldur.
    // Her aralık, 0.044 yüksekliğinde üçgen bir yüzey olarak oluşturulur.
    const baseFaceSlotsInPathOrder = [
      ...SIDE_SLOT_LAYOUT.slice().reverse(),
      ...SPIRAL_SLOT_LAYOUT
    ];
    const baseFacePositions: number[] = [];
    const baseFaceIndices: number[] = [];
    const baseFaceAnchor = crownLowerRightGuidePoint.clone();
    baseFaceAnchor.y = 0.044;

    for (let i = 1; i < baseFaceSlotsInPathOrder.length; i++) {
      const previousBasePoint = getSlotUpperLeft(baseFaceSlotsInPathOrder[i - 1]);
      const currentBasePoint = getSlotUpperLeft(baseFaceSlotsInPathOrder[i]);
      previousBasePoint.y = 0.044;
      currentBasePoint.y = 0.044;

      const vertexOffset = baseFacePositions.length / 3;
      baseFacePositions.push(
        previousBasePoint.x, previousBasePoint.y, previousBasePoint.z,
        currentBasePoint.x, currentBasePoint.y, currentBasePoint.z,
        baseFaceAnchor.x, baseFaceAnchor.y, baseFaceAnchor.z
      );
      baseFaceIndices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2);
    }

    const a30A29BaseFaceGeometry = new THREE.BufferGeometry();
    a30A29BaseFaceGeometry.setAttribute("position", new THREE.Float32BufferAttribute(
      baseFacePositions,
      3
    ));
    a30A29BaseFaceGeometry.setIndex(baseFaceIndices);
    a30A29BaseFaceGeometry.computeVertexNormals();

    return {
      slots,
      slotLabels,
      aSlotPosition,
      descendingSideSlots,
      wallGeometry,
      wallGuideLine,
      crownS2VerticalGuideLine,
      slotToCrownS2HorizontalGuideLines,
      slotUpperLeftToBaseGuideLines,
      slotFrontFacePanels,
      slotSideFacePanels,
      slot119ToCrownS1WallGeometry,
      slot119ToCrownS1WallMaterial,
      blueFrontFaceMaterial,
      slotFrontFaceMaterial,
      slotBaseToBaseGuideLines,
      slotBaseToCrownS2GuideLines,
      slot118ToCrownGuideLine,
      crownPanelGeometry,
      crownS1S2ToBaseWallGeometry,
      crownPanelConnectorLine,
      crownPanelBaseEdgeLine,
      wallGuideLabels,
      crownWallGeometry,
      crownWallPosition,
      wallConnectorGeometry,
      wallRightConnectorGeometry,
      wallConnectorFillGeometry,
      wallToCrownConnectors,
      // SIDE_SLOT_LAYOUT son elemanı A30'dur; .left yüzeyi A30-SÜ → 120A30-SÜ duvarıdır.
      a30ToCrownWallGeometry: wallToCrownConnectors[wallToCrownConnectors.length - 1].left,
      sideSeriesRightWallGeometry,
      crownSeriesRightWallGeometry,
      a30A29BaseFaceGeometry,
      a30SpiralGuideLine,
      a30SpiralBottomLine,
      a44OuterArchOutline,
      a44InnerArchOutline,
      a44PosterPosition,
      a44PosterQuaternion,
      a44ToCrownS2GuideLine,
      a31ToA43CrownS2GuideLines,
      a30A44WallGeometry,
      upperBridgeFacePanels,
      upperBridgeGreenMaterial,
      crownPanelMaterial,
      a30A29EnclosedFaceGeometry,
      a30A44CrownS2FacePanels,
      a30A29EnclosedFaceMaterial,
    };
  }, []);

  const accent = useMemo(() => new THREE.Color(BRONZE_TOWER.accentColor), []);
  const slotGeometry = useMemo(() => new THREE.BoxGeometry(0.92, 1.38, 0.075), []);
  const aSlotGeometry = useMemo(() => new THREE.BoxGeometry(0.92, 1.346552, 0.075), []);
  const slotMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff",
    metalness: 0.68,
    roughness: 0.38,
    emissive: accent,
    emissiveIntensity: 0.12
  }), [accent]);



  return (
    <group>
      {/* Sabit mavi yüzeyler: useMemo içinde bir kez oluşturulur, tekrar renderda üretilmez. */}
      {dims.slotFrontFacePanels.map((panel, index) => (
        <primitive key={`blue-front-face-panel-${index}`} object={panel} />
      ))}
      {dims.slotSideFacePanels.map((panel, index) => (
        <primitive key={`blue-side-face-panel-${index}`} object={panel} />
      ))}
      <mesh
        geometry={dims.slot119ToCrownS1WallGeometry}
        material={dims.blueFrontFaceMaterial}
        renderOrder={10}
      />
      {dims.upperBridgeFacePanels.map((panel, index) => (
        <primitive key={`upper-bridge-face-${index}`} object={panel} />
      ))}
      <mesh
        geometry={dims.crownPanelGeometry}
        material={dims.crownPanelMaterial}
        renderOrder={9}
      />
      <mesh
        geometry={dims.crownS1S2ToBaseWallGeometry}
        material={dims.blueFrontFaceMaterial}
        renderOrder={10}
      />
      <mesh
        geometry={dims.a30A44WallGeometry}
        material={dims.blueFrontFaceMaterial}
        renderOrder={10}
      />
      <primitive object={dims.a44OuterArchOutline} />
      <primitive object={dims.a44InnerArchOutline} />
      <group
        position={dims.a44PosterPosition}
        quaternion={dims.a44PosterQuaternion}
      >
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.88, 1.28]} />
          <meshStandardMaterial
            color="#101827"
            emissive="#17243a"
            emissiveIntensity={0.32}
            roughness={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[0.84, 1.24]} />
          <meshBasicMaterial color="#263c50" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.28, 0.012]}>
          <circleGeometry args={[0.245, 48]} />
          <meshBasicMaterial color="#d39b55" />
        </mesh>
        <mesh position={[0, 0.28, 0.016]}>
          <circleGeometry args={[0.19, 48]} />
          <meshBasicMaterial color="#263c50" />
        </mesh>
        <Text
          position={[0, -0.12, 0.02]}
          fontSize={0.105}
          color="#f4dfb4"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          lineHeight={1.15}
          maxWidth={0.78}
        >
          CINE
          {"\\n"}
          BABYLON
        </Text>
        <Text
          position={[0, -0.43, 0.02]}
          fontSize={0.045}
          color="#d39b55"
          anchorX="center"
          anchorY="middle"
        >
          A SAMPLE POSTER
        </Text>
      </group>
      {dims.a30A44CrownS2FacePanels.map((panel, index) => (
        <primitive key={`a31-a44-crown-s2-face-${index}`} object={panel} />
      ))}

      {dims.wallGuideLabels.map((label) => (
        <Text
          key={label.name}
          position={label.position.clone().add(new THREE.Vector3(0.08, 0.06, 0.04))}
          fontSize={0.13}
          color="#ff4b4b"
          outlineColor="#090b12"
          outlineWidth={0.012}
          anchorX="left"
          anchorY="middle"
          renderOrder={12}
        >
          {label.name}
        </Text>
      ))}
      {SHOW_SLOTS && (
        <>
          <InstancedSlots matrices={dims.slots} geometry={slotGeometry} material={slotMaterial} />
          <mesh
            geometry={aSlotGeometry}
            material={slotMaterial}
            position={dims.aSlotPosition}
            rotation={[0, SIDE_SLOT_LAYOUT[0].rotationY, 0]}
          />
          {dims.descendingSideSlots.map((slot, index) => (
            <mesh
              key={`A${index + 1}`}
              position={slot.position}
              rotation={[0, slot.rotationY, 0]}
              material={slotMaterial}
            >
              <boxGeometry args={[0.92, slot.height, 0.075]} />
            </mesh>
          ))}
          {dims.slotLabels.map((label) => (
            <Text
              key={label.number}
              position={label.position}
              rotation={label.rotation}
              fontSize={0.24}
              color="#ffffff"
              outlineColor="#090b12"
              outlineWidth={0.012}
              anchorX="center"
              anchorY="middle"
              renderOrder={2}
            >
              {label.number}
            </Text>
          ))}
        </>
      )}
    </group>
  );
}

export default function BabelTowerArchitecture() {
  // Kamera ve sis değerleri yeni spiral geometrisinin gerçek ölçülerinden türetilir.
  const posterWidth = 0.92;
  const posterHeight = 1.38;
  const arcStep = posterWidth + 0.04;
  const unitsByRing = [12, 11, 10];
  const rowsPerRing = 3;
  const totalSlots = unitsByRing.reduce((sum, units) => sum + units * rowsPerRing, 0);
  const taper = 0.56;
  const turnGap = 0.65;
  const baseRadius = (arcStep / (2 * Math.sin(Math.PI / unitsByRing[0]))) * 5.0;
  const topRadius = baseRadius * (1 - taper);
  const radialStep = (baseRadius - topRadius) / (totalSlots - 1);

  // Kamera yüksekliğini modelde kullanılan değişken yükselme adımlarıyla eşleştir.
  let bodyHeight = posterHeight / 2 + 0.12;
  for (let i = 0; i < totalSlots; i++) {
    const slotRadius = baseRadius - i * radialStep;
    bodyHeight += (posterHeight + turnGap) * arcStep / (2 * Math.PI * slotRadius);
  }
  const height = bodyHeight + 0.95;
  const radius = baseRadius;

  return (
    <Canvas shadows dpr={[1, 1.7]}
      camera={{ position: [radius * 3.3, height * 1.8, radius * 4.8], fov: 50 }}>
      <color attach="background" args={["#090b12"]} />
      <ambientLight intensity={0.68} />
      <directionalLight position={[18, height * 1.6, 14]} intensity={2.0}
        castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-radius * 2, height * 0.55, -radius]}
        intensity={height * 0.1} color={BRONZE_TOWER.accentColor} />
      <pointLight position={[radius, height * 0.9, radius * 1.5]}
        intensity={height * 0.065} color="#9eb7ff" />
      <BronzeTowerModel />
      <Environment preset="city" />
      <OrbitControls makeDefault enableDamping dampingFactor={0.06}
        zoomSpeed={1.4} minDistance={radius * 1.5} maxDistance={height * 18}
        maxPolarAngle={Math.PI * 0.49} target={[0, height * 0.48, 0]} />
    </Canvas>
  );
}
