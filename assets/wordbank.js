/* Kho từ theo chủ đề (Word bank), dùng chung cho 3 trang Ôn tập nói (Mầm non, Lớp 1, Lớp 4).
   Nạp TRƯỚC assets/speaking.js. speaking.js tự xếp từ của các Unit đã học vào đúng chủ đề,
   thêm các từ có trong bài nói, rồi hiện phần còn lại của chủ đề thành "➕ More words" để mở rộng.

   Cách ghi một từ:  "hình từ tiếng Anh=nghĩa tiếng Việt"   (các từ cách nhau bằng dấu ;)
     hình: emoji, "n:12" (ô số), "c:#màu" (ô màu), "s:circle:#màu" (hình khối)
     thêm ^2 ở cuối: chỉ hiện từ Lớp 1 trở lên · ^3: chỉ hiện ở Lớp 4 · ^9: không hiện ở ➕ More words, chỉ hiện khi Unit hay bài nói có từ đó.
     Không ghi: hiện ở cả 3 khối.
   Một từ có thể nằm ở nhiều chủ đề (star: hình dạng và bầu trời).
   Chủ đề ghi nm:1 thì không dò từ trong bài nói (từ chức năng như in, on, go hay gặp).
   Không ghi tên sách hay nhà xuất bản lên trang. */
window.WORDBANK = { sections: [

{ id: "animals", ic: "🐾", en: "Animals", vi: "Động vật", topics: [
  { ic: "🐄", en: "Farm animals", vi: "Vật nuôi ở trang trại", w:
    "🐄 cow=con bò; 🐖 pig=con lợn; 🦆 duck=con vịt; 🐔 chicken=con gà; 🐔 hen=gà mái; 🐓 rooster=gà trống; 🐤 chick=gà con; 🐑 sheep=con cừu; 🐐 goat=con dê; 🐴 horse=con ngựa; 🐃 buffalo=con trâu; 🐂 ox=con bò đực; 🦃 turkey=gà tây; 🐰 rabbit=con thỏ; 🐴 donkey=con lừa^2; 🦙 llama=lạc đà không bướu^2; 🧑‍🌾 farm=nông trại" },
  { ic: "🐶", en: "Pets", vi: "Thú cưng", w:
    "🐾 pet=thú cưng; 🐶 dog=con chó; 🐕 puppy=chó con; 🐱 cat=con mèo; 🐈 kitten=mèo con; 🐹 hamster=chuột hamster; 🐠 goldfish=cá vàng; 🦜 parrot=con vẹt; 🐰 bunny=thỏ con; 🐢 turtle=con rùa" },
  { ic: "🦁", en: "Wild animals", vi: "Động vật hoang dã", w:
    "🦁 lion=sư tử; 🐯 tiger=con hổ; 🐘 elephant=con voi; 🦒 giraffe=hươu cao cổ; 🐒 monkey=con khỉ; 🦓 zebra=ngựa vằn; 🐻 bear=con gấu; 🐼 panda=gấu trúc; 🦊 fox=con cáo; 🐺 wolf=chó sói; 🦌 deer=con hươu; 🦘 kangaroo=chuột túi; 🦛 hippo=hà mã; 🦏 rhino=tê giác; 🦍 gorilla=khỉ đột; 🐪 camel=lạc đà; 🐨 koala=gấu túi; 🐿️ squirrel=con sóc; 🦔 hedgehog=con nhím; 🦇 bat=con dơi; 🐭 mouse=con chuột; 🐆 leopard=con báo; 🦝 raccoon=gấu mèo^2; 🦥 sloth=con lười^2; 🦦 otter=rái cá^2; 🐻 polar bear=gấu Bắc Cực; 🏞️ zoo=sở thú; 🌳 jungle=rừng rậm^2" },
  { ic: "🐦", en: "Birds", vi: "Các loài chim", w:
    "🐦 bird=con chim; 🦉 owl=con cú; 🦅 eagle=đại bàng; 🐧 penguin=chim cánh cụt; 🦚 peacock=con công; 🦢 swan=thiên nga; 🦩 flamingo=hồng hạc; 🕊️ dove=chim bồ câu; 🦜 parrot=con vẹt; 🐥 baby bird=chim non; 🐣 nest=tổ chim; 🥚 egg=quả trứng; 🦚 feather=lông vũ; 🦆 duck=con vịt; 🐓 rooster=gà trống" },
  { ic: "🐟", en: "Fish and sea animals", vi: "Cá và sinh vật biển", w:
    "🐟 fish=con cá; 🐠 tropical fish=cá nhiệt đới; 🐡 pufferfish=cá nóc; 🦈 shark=cá mập; 🐳 whale=cá voi; 🐬 dolphin=cá heo; 🐙 octopus=bạch tuộc; 🦑 squid=con mực; ⭐ starfish=sao biển; 🐢 sea turtle=rùa biển; 🐚 shell=vỏ sò, vỏ ốc; 🌊 sea=biển; 🌊 ocean=đại dương^2" },
  { ic: "🦀", en: "Crabs, shrimps and lobsters", vi: "Giáp xác (cua, tôm, tôm hùm)", w:
    "🦀 crab=con cua; 🦐 shrimp=con tôm; 🦞 lobster=tôm hùm; 🐚 hermit crab=ốc mượn hồn; 🦞 crayfish=tôm càng^2; 🦐 prawn=tôm he^3; 🦀 claws=cái càng; 🛡️ hard shell=lớp vỏ cứng^2; 🦵 ten legs=mười cái chân^2; 🦐 crustacean=loài giáp xác^3" },
  { ic: "🐍", en: "Reptiles", vi: "Bò sát", w:
    "🐍 snake=con rắn; 🐢 turtle=con rùa; 🐢 tortoise=rùa cạn^2; 🐊 crocodile=cá sấu; 🐊 alligator=cá sấu mõm ngắn^3; 🦎 lizard=thằn lằn; 🦎 gecko=tắc kè, thạch sùng; 🦎 chameleon=tắc kè hoa; 🦎 iguana=kỳ nhông^3; 🦖 dinosaur=khủng long; 🦖 T-rex=khủng long bạo chúa; 🦕 long-neck dinosaur=khủng long cổ dài; 🐍 scales=vảy^2; 🐍 reptile=loài bò sát^3" },
  { ic: "🐸", en: "Frogs and friends", vi: "Lưỡng cư (ếch, nhái, cóc)", w:
    "🐸 frog=con ếch; 🐸 toad=con cóc; 🐸 tadpole=nòng nọc; 🦎 salamander=kỳ giông^3; 🐸 amphibian=loài lưỡng cư^3; 🐸 jump=nhảy; 🏊 swim=bơi" },
  { ic: "🐝", en: "Insects and bugs", vi: "Côn trùng và các con bọ", w:
    "🐜 ant=con kiến; 🐝 bee=con ong; 🦋 butterfly=con bướm; 🐞 ladybird=bọ rùa; 🦗 cricket=con dế; 🦗 grasshopper=châu chấu; 🦟 mosquito=con muỗi; 🐛 caterpillar=sâu bướm; 🐛 bug=con bọ; 🦋 moth=bướm đêm^2; ✨ firefly=đom đóm^2; 🍯 beehive=tổ ong^2; 🐜 insect=côn trùng^2; 🦵 six legs=sáu cái chân^2; 📡 antennae=râu (côn trùng)^3" },
  { ic: "🕷️", en: "Small creatures", vi: "Các con vật nhỏ khác", w:
    "🕷️ spider=con nhện; 🕸️ web=mạng nhện; 🐌 snail=con ốc sên; 🐛 worm=con giun, con sâu; 🦂 scorpion=bọ cạp^2; 🕷️ eight legs=tám cái chân" },
  { ic: "🐒", en: "Animal bodies", vi: "Bộ phận của con vật", w:
    "🐒 tail=cái đuôi; 🦅 wings=đôi cánh; 🐾 paws=bàn chân (con vật); 🐥 beak=cái mỏ; 🐻 fur=bộ lông thú; 🐠 fins=vây cá; 🐂 horns=sừng; 🦀 claws=cái càng, móng vuốt; 🦚 feather=lông vũ; 🦒 neck=cái cổ; 🐘 trunk=vòi voi; 🦁 mane=cái bờm^2; 🐱 whiskers=ria mép^2; 🦓 stripes=sọc vằn^2; 🐆 spots=đốm^2; 🐍 scales=vảy^2; 🦒 long neck=cổ dài; 🐰 long ears=tai dài; 🐘 long nose=mũi dài; 🐒 long tail=đuôi dài; 🐦 two wings=hai cánh" },
  { ic: "🔊", en: "Animal sounds", vi: "Tiếng kêu của con vật", w:
    "🐄 moo=ò ò (bò); 🐖 oink=ủn ỉn (lợn); 🦆 quack=cạc cạc (vịt); 🐔 cluck=cục tác (gà); 🐶 woof=gâu gâu (chó); 🐶 bark=sủa; 🐱 meow=meo meo (mèo); 🐑 baa=be be (cừu); 🐴 neigh=hí hí (ngựa); 🦁 roar=gầm; 🐦 tweet=chiếp chiếp (chim); 🐝 buzz=vo ve (ong); 🐍 hiss=xì xì (rắn); 🐸 ribbit=ộp ộp (ếch); 🐭 squeak=chít chít (chuột); 🦉 hoot=hú hú (cú)^2" }
]},

{ id: "nature", ic: "🔬", en: "Nature and science", vi: "Thiên nhiên và Khoa học", topics: [
  { ic: "🌳", en: "Plants", vi: "Cây cối", w:
    "🌳 tree=cái cây; 🌸 flower=bông hoa; 🍃 leaf=chiếc lá; 🍁 leaves=lá cây; 🌱 seed=hạt giống; 🌿 grass=cỏ; 🌱 plant=cây trồng; 🌻 sunflower=hoa hướng dương; 🌹 rose=hoa hồng; 🌷 tulip=hoa tulip; 🌵 cactus=cây xương rồng; 🍄 mushroom=cây nấm; 🌴 palm tree=cây cọ; 🎋 bamboo=cây tre; 🌲 forest=khu rừng; 🌾 rice field=cánh đồng lúa; 🌿 stem=thân cây^3; 💧 water the plants=tưới cây" },
  { ic: "🌦️", en: "Weather", vi: "Thời tiết", w:
    "🌦️ weather=thời tiết; ☀️ sunny=trời nắng; 🌧️ rainy=trời mưa; ☁️ cloudy=nhiều mây; 💨 windy=có gió; ❄️ snowy=có tuyết; ⛈️ stormy=có dông bão; 🌫️ foggy=có sương mù^2; 🥵 hot=nóng; 🥶 cold=lạnh; 🌤️ warm=ấm; 🍃 cool=mát; 🌧️ rain=mưa; 💨 wind=gió; ☁️ cloud=đám mây; ❄️ snow=tuyết; 🌈 rainbow=cầu vồng; ⚡ thunder=sấm^2; 🌩️ lightning=tia chớp^2; ☂️ umbrella=cái ô; 💦 wet=ướt" },
  { ic: "🍂", en: "Seasons", vi: "Các mùa", w:
    "🗓️ season=mùa; 🌸 spring=mùa xuân; 🏖️ summer=mùa hè; 🍂 autumn=mùa thu; ⛄ winter=mùa đông; ⛄ snowman=người tuyết; 🍁 leaves=lá cây; 🌷 flowers=những bông hoa" },
  { ic: "🌙", en: "Sky and space", vi: "Bầu trời và vũ trụ", w:
    "☀️ sun=mặt trời; 🌙 moon=mặt trăng; ⭐ star=ngôi sao; 🌤️ sky=bầu trời; 🌍 Earth=Trái Đất; 🪐 planet=hành tinh; 🚀 rocket=tên lửa; 🧑‍🚀 astronaut=phi hành gia; 👽 alien=người ngoài hành tinh; 🛸 UFO=đĩa bay; 🔭 telescope=kính thiên văn^2; ☄️ comet=sao chổi^3; 🌌 space=vũ trụ^2; 🌑 night sky=bầu trời đêm" },
  { ic: "👀", en: "My five senses", vi: "Năm giác quan", w:
    "👀 see=nhìn thấy; 👂 hear=nghe thấy; 👃 smell=ngửi; 👅 taste=nếm; ✋ touch=chạm, sờ; 👀 eyes=đôi mắt; 👂 ears=đôi tai; 👃 nose=cái mũi; 👅 tongue=cái lưỡi; 🖐️ hands=đôi tay; 🤢 smelly=hôi; 🧸 soft=mềm; 🧱 hard=cứng; 📢 loud=to, ồn; 🤫 quiet=yên tĩnh" },
  { ic: "🧪", en: "Science words", vi: "Từ của môn Khoa học", w:
    "🔬 science=môn Khoa học; 💧 water=nước; 🧊 ice=nước đá; 🔥 fire=lửa; 💡 light=ánh sáng; 👤 shadow=cái bóng; 🧲 magnet=nam châm; 🛶 float=nổi; ⚓ sink=chìm; 🥛 pour=rót; 🧊 melt=tan chảy^2; ❄️ freeze=đông cứng^2; 🌡️ hot and cold=nóng và lạnh; 🗿 rock=hòn đá; 🏖️ sand=cát; 🟫 soil=đất^2; 💨 air=không khí^2; 🌱 grow=lớn lên, mọc; 🌱 seed=hạt giống; 🥚 egg=quả trứng; 🐛 caterpillar=sâu bướm; 🦋 butterfly=con bướm; 🐸 tadpole=nòng nọc; 🔬 microscope=kính hiển vi^2; 🧪 experiment=thí nghiệm^2; 🧑‍🔬 scientist=nhà khoa học^2; 🧫 living things=sinh vật^3; 🔄 life cycle=vòng đời^3; 🌲 wood=gỗ^2; 📄 paper=giấy^2; 🔩 metal=kim loại^2; 🥤 plastic=nhựa^2; 🍶 glass=thủy tinh^3" }
]},

{ id: "body", ic: "🧍", en: "My body", vi: "Cơ thể của con", topics: [
  { ic: "🧑", en: "Body parts", vi: "Các bộ phận cơ thể", w:
    "🧍 body=cơ thể; 🧑 head=cái đầu; 💇 hair=tóc; 😀 face=khuôn mặt; 👀 eyes=đôi mắt; 👂 ears=đôi tai; 👃 nose=cái mũi; 👄 mouth=cái miệng; 🦷 teeth=răng; 👅 tongue=cái lưỡi; 🦒 neck=cái cổ; 🤷 shoulders=đôi vai; 💪 arm=cánh tay; ✋ hand=bàn tay; 🙌 hands=đôi tay; ☝️ finger=ngón tay; 🦵 leg=cái chân; 🦵 legs=đôi chân; 🦵 knee=đầu gối^2; 🦶 foot=bàn chân; 🦶 feet=đôi bàn chân; 🦶 toes=ngón chân; 🦶 ten toes=mười ngón chân; 😋 tummy=cái bụng; ❤️ heart=trái tim" },
  { ic: "👏", en: "Move my body", vi: "Vận động cơ thể", w:
    "👏 clap hands=vỗ tay; 👏 clap=vỗ tay; 🥾 stomp feet=dậm chân; 🥾 stomp=dậm chân; ☝️ touch nose=chạm mũi; 👋 wave hands=vẫy tay; 😮 open mouth=há miệng; 🙂 nod=gật đầu; 🙃 shake=lắc; 🙆 stretch=vươn vai; 🩰 tiptoe=đi nhón chân; 🔄 turn around=quay một vòng" },
  { ic: "🧼", en: "Healthy habits", vi: "Thói quen tốt cho sức khỏe", w:
    "🧼 wash my hands=rửa tay; 🦷 brush my teeth=đánh răng; 🧼 wash my face=rửa mặt; 🛁 take a bath=tắm; 😴 sleep=ngủ; 🥦 eat vegetables=ăn rau; 💧 drink water=uống nước; 🏃 exercise=tập thể dục; 🤧 tissue=khăn giấy; 🤒 sick=bị ốm; 🤕 hurt=bị đau; 🩹 plaster=băng dán vết thương^2; 💊 medicine=thuốc; 🧑‍⚕️ doctor=bác sĩ; 🧼 soap=xà phòng; 🦷 toothbrush=bàn chải đánh răng; 🧺 towel=khăn tắm" }
]},

{ id: "maths", ic: "🔢", en: "Maths", vi: "Toán học", topics: [
  { ic: "🔢", en: "Numbers 0–10", vi: "Số đếm 0–10", w:
    "n:0 zero=số không; n:1 one=một; n:2 two=hai; n:3 three=ba; n:4 four=bốn; n:5 five=năm; n:6 six=sáu; n:7 seven=bảy; n:8 eight=tám; n:9 nine=chín; n:10 ten=mười" },
  { ic: "🔟", en: "Numbers 11–20", vi: "Số đếm 11–20", w:
    "n:11 eleven=mười một; n:12 twelve=mười hai; n:13 thirteen=mười ba; n:14 fourteen=mười bốn; n:15 fifteen=mười lăm; n:16 sixteen=mười sáu; n:17 seventeen=mười bảy; n:18 eighteen=mười tám; n:19 nineteen=mười chín; n:20 twenty=hai mươi" },
  { ic: "💯", en: "Tens and big numbers", vi: "Số tròn chục và số lớn", w:
    "n:20 twenty=hai mươi; n:30 thirty=ba mươi; n:40 forty=bốn mươi^2; n:45 forty-five=bốn mươi lăm^2; n:50 fifty=năm mươi^2; n:60 sixty=sáu mươi^2; n:70 seventy=bảy mươi^2; n:80 eighty=tám mươi^2; n:90 ninety=chín mươi^2; n:100 one hundred=một trăm; n:1000 thousand=một nghìn^3; n:1000 one thousand=một nghìn^3" },
  { ic: "➕", en: "Maths words", vi: "Từ của môn Toán", w:
    "🔢 maths=môn Toán; 🔢 number=con số; 🔢 count=đếm; ❓ how many=bao nhiêu; ➕ plus=cộng; ➖ minus=trừ; n:= equals=bằng; ➕ add=cộng vào^2; ➖ take away=bớt đi^2; ✖️ times=nhân^3; ➗ divided by=chia^3; ⬆️ more=nhiều hơn; ⬇️ less=ít hơn^2; 👯 same=giống nhau; 🥇 first=thứ nhất; 🥈 second=thứ hai; 🥉 third=thứ ba; 🌓 half=một nửa^2; n:2 even=số chẵn^3; n:3 odd=số lẻ^3; 📊 total=tổng cộng^3; 🧮 sum=phép tính^3; 💰 money=tiền; 💲 coin=đồng xu^2; 💵 thousand dong=nghìn đồng^3; 🏷️ how much=giá bao nhiêu^2" },
  { ic: "🔺", en: "Shapes", vi: "Hình dạng", w:
    "🔷 shape=hình; s:circle:#E53935 circle=hình tròn; s:square:#1E88E5 square=hình vuông; s:triangle:#43A047 triangle=hình tam giác; s:rectangle:#FB8C00 rectangle=hình chữ nhật; s:star:#FDD835 star=ngôi sao; s:heart:#EC407A heart=trái tim; 🔷 diamond=hình thoi; 🥚 oval=hình bầu dục^2; s:cube:#8E24AA cube=khối lập phương^2; s:sphere:#1E88E5 sphere=khối cầu^3; s:cylinder:#43A047 cylinder=khối trụ^3; s:cone:#FB8C00 cone=khối nón^3; s:cuboid:#E53935 cuboid=khối hộp chữ nhật^3" },
  { ic: "📏", en: "Size and measure", vi: "Kích thước, đo lường", w:
    "z:big:🎈 big=to; z:small:🎈 small=nhỏ; 🦒 tall=cao; 🐧 short=thấp, ngắn; 🐍 long=dài; 🐭 little=nhỏ bé; 🏋️ heavy=nặng^2; 🎈 light=nhẹ^2; 📏 ruler=cái thước; 📏 measure=đo^2; 📬 full=đầy^2; 📭 empty=rỗng^2; ↔️ wide=rộng^3; ↕️ narrow=hẹp^3; 📏 centimetre=xăng-ti-mét^3; 📏 metre=mét^3; ⚖️ kilogram=ki-lô-gam^3; 🔝 biggest=to nhất^2; 🔻 smallest=nhỏ nhất^2" },
  { ic: "📦", en: "Where is it?", vi: "Vị trí: ở đâu?", nm: 1, w:
    "❓ where=ở đâu; 📥 in=ở trong; 🔝 on=ở trên; ⬇️ under=ở dưới; ↔️ next to=bên cạnh; 🔙 behind=ở phía sau; 🔜 in front of=ở phía trước; ↕️ between=ở giữa; 📍 near=ở gần; 🔁 opposite=đối diện^2; ⬆️ above=ở phía trên^2; ⬇️ below=ở phía dưới^2; 📦 box=cái hộp; 🪑 table=cái bàn" }
]},

{ id: "geo", ic: "🌏", en: "Geography", vi: "Địa lý", topics: [
  { ic: "⛰️", en: "Land and water", vi: "Núi, sông, biển", w:
    "⛰️ mountain=ngọn núi; ⛰️ mountains=núi; 🌄 hill=ngọn đồi; 🏞️ river=dòng sông; 🏞️ lake=cái hồ; 🌊 sea=biển; 🌊 ocean=đại dương^2; 🏖️ beach=bãi biển; 🏝️ island=hòn đảo; 🏜️ desert=sa mạc; 🌲 forest=khu rừng; 🌴 jungle=rừng rậm^2; 🌋 volcano=núi lửa; 💦 waterfall=thác nước; 🕳️ cave=hang động^2; 🌾 field=cánh đồng; 🏞️ valley=thung lũng^3; 🗿 rock=hòn đá; 🏖️ sand=cát" },
  { ic: "🧭", en: "Maps and directions", vi: "Bản đồ và phương hướng", nm: 1, w:
    "🗺️ map=bản đồ; 🧭 compass=la bàn^2; ⬅️ left=bên trái; ➡️ right=bên phải; ⬆️ up=lên; ⬇️ down=xuống; 🚶 go straight=đi thẳng; ⬅️ turn left=rẽ trái; ➡️ turn right=rẽ phải; 🔄 turn round=quay lại; 👇 here=ở đây; 👉 there=ở đằng kia; 🛑 stop=dừng lại; 🟢 go=đi; n:N north=phía bắc^2; n:S south=phía nam^2; n:E east=phía đông^2; n:W west=phía tây^2; 💰 treasure=kho báu; 🔎 find=tìm thấy" },
  { ic: "🌍", en: "Our world", vi: "Thế giới của chúng ta", w:
    "🌍 world=thế giới; 🌍 Earth=Trái Đất; 🌐 globe=quả địa cầu^2; 🌏 Asia=châu Á^2; 🌍 Europe=châu Âu^2; 🌍 Africa=châu Phi^2; 🌎 America=châu Mỹ, nước Mỹ; 🦘 Australia=nước Úc, châu Úc; 🐧 Antarctica=châu Nam Cực^3; 🌊 Pacific Ocean=Thái Bình Dương^3; 🗺️ continent=châu lục^3; 🚩 country=đất nước; 🚩 flag=lá cờ; 🏙️ capital=thủ đô^3" },
  { ic: "🇻🇳", en: "Countries and cities", vi: "Đất nước và thành phố", w:
    "🇻🇳 Viet Nam=Việt Nam; 🏙️ Ha Noi=Hà Nội; 🏙️ Ho Chi Minh City=Thành phố Hồ Chí Minh^2; 🏞️ Viet Tri=Việt Trì; 🇯🇵 Japan=Nhật Bản^2; 🗼 Tokyo=Tô-ki-ô^3; 🇹🇭 Thailand=Thái Lan^2; 🏯 Bangkok=Băng Cốc^3; 🇲🇾 Malaysia=Ma-lai-xi-a^2; 🇸🇬 Singapore=Xin-ga-po^2; 🇬🇧 Britain=nước Anh^2; 🕰️ London=Luân Đôn^3; 🇺🇸 America=nước Mỹ; 🇦🇺 Australia=nước Úc; 🏟️ Sydney=Xít-ni^3; 🇨🇳 China=Trung Quốc^2; 🇰🇷 Korea=Hàn Quốc^2; 🇫🇷 France=nước Pháp^2; 🇮🇳 India=Ấn Độ^2; 🇰🇭 Cambodia=Cam-pu-chia^3; 🇱🇦 Laos=Lào^3; 🌐 countries=các nước^2" },
  { ic: "🏘️", en: "City and countryside", vi: "Thành phố và nông thôn", w:
    "🏙️ city=thành phố; 🏘️ town=thị trấn; 🏘️ village=làng; 🌄 countryside=vùng nông thôn; 🏢 building=tòa nhà; 🛣️ street=đường phố; 🛣️ road=con đường; 🌉 bridge=cây cầu; 🧑‍🌾 farm=nông trại; 🏙️ busy=đông đúc, nhộn nhịp; 🤫 quiet=yên tĩnh; 📢 noisy=ồn ào; 🏠 live=sống" }
]},

{ id: "people", ic: "🧒", en: "People", vi: "Con người", topics: [
  { ic: "😊", en: "Feelings", vi: "Cảm xúc", w:
    "😊 happy=vui; 😢 sad=buồn; 😠 angry=tức giận; 😨 scared=sợ hãi; 😩 tired=mệt; 😴 sleepy=buồn ngủ; 😋 hungry=đói; 🥤 thirsty=khát; 👍 good=khỏe, tốt; 🙂 fine=khỏe; 🤩 excited=háo hức; 😮 surprised=ngạc nhiên; 🥱 bored=chán^2; 😳 shy=xấu hổ^2; 🤒 sick=bị ốm; 😌 full=no (ăn no); ❤️ love=yêu thương" },
  { ic: "👪", en: "Family", vi: "Gia đình", w:
    "👪 family=gia đình; 👩 mom=mẹ; 👨 dad=bố; 👩 mother=mẹ; 👨 father=bố; 👦 brother=anh, em trai; 👧 sister=chị, em gái; 👶 baby=em bé; 👵 grandma=bà; 👴 grandpa=ông; 👵 grandmother=bà; 👴 grandfather=ông; 👨 uncle=chú, bác, cậu^2; 👩 aunt=cô, dì^2; 🧒 cousin=anh chị em họ^2; 👫 parents=bố mẹ^2; 👴 grandparents=ông bà^2; 🏠 home=nhà" },
  { ic: "🧑‍🤝‍🧑", en: "Friends and people", vi: "Bạn bè và mọi người", w:
    "🧒 friend=bạn; 👦 boy=bạn trai; 👧 girl=bạn gái; 🧒 kid=em bé, trẻ con; 👨 man=người đàn ông; 👩 woman=người phụ nữ; 👩‍🏫 teacher=cô giáo; 👦 he=bạn ấy (nam); 👧 she=bạn ấy (nữ); 🏷️ name=tên; 🎂 how old=bao nhiêu tuổi; 🧑‍🤝‍🧑 team=đội" },
  { ic: "💇", en: "What do they look like?", vi: "Tả người", w:
    "🦒 tall=cao; 🐧 short=thấp; 🧍 slim=mảnh khảnh; 💇‍♀️ long hair=tóc dài; 💇 short hair=tóc ngắn; 👀 big eyes=mắt to; 😀 round face=mặt tròn; 🥰 cute=đáng yêu; 😂 funny=vui tính; 💪 strong=khỏe; 🦁 brave=dũng cảm; 🤗 kind=tốt bụng^2; 🧠 clever=thông minh^2; 🌸 pretty=đẹp, xinh; 🦚 beautiful=rất đẹp; 🌟 nice=ngon, đẹp, tốt" },
  { ic: "👩‍⚕️", en: "Jobs", vi: "Nghề nghiệp", w:
    "💼 job=nghề nghiệp; 👩‍🏫 teacher=giáo viên; 🧑‍⚕️ doctor=bác sĩ; 👩‍⚕️ nurse=y tá; 🧑‍🌾 farmer=nông dân; 🧑‍🍳 cook=đầu bếp; 🚌 driver=tài xế; 👷 worker=công nhân; 👮 police officer=cảnh sát; 👮 policeman=chú công an; 🎤 singer=ca sĩ; 🎬 actor=diễn viên; 🎨 painter=họa sĩ; ⚽ footballer=cầu thủ bóng đá; 💼 office worker=nhân viên văn phòng; 🧑‍✈️ pilot=phi công; 🧑‍🚒 firefighter=lính cứu hỏa; 🦷 dentist=nha sĩ^2; 🧑‍🔬 scientist=nhà khoa học^2; 🧑‍🚀 astronaut=phi hành gia; 🍞 baker=thợ làm bánh^2; 📮 postman=bác đưa thư^2; 🐾 vet=bác sĩ thú y^3; 🇬🇧 English teacher=giáo viên Tiếng Anh^2; 🔢 maths teacher=giáo viên Toán^2" }
]},

{ id: "food", ic: "🍎", en: "Food and drinks", vi: "Đồ ăn, thức uống", topics: [
  { ic: "🍓", en: "Fruit", vi: "Hoa quả", w:
    "🍎 apple=quả táo; 🍌 banana=quả chuối; 🍊 orange=quả cam; 🥭 mango=quả xoài; 🍇 grapes=chùm nho; 🍋 lemon=quả chanh; 🍉 watermelon=dưa hấu; 🍓 strawberry=dâu tây; 🍍 pineapple=quả dứa; 🍒 cherry=quả anh đào; 🍐 pear=quả lê; 🍑 peach=quả đào; 🥥 coconut=quả dừa; 🥝 kiwi=quả kiwi; 🍈 melon=dưa lưới^2; 🍇 fruit=hoa quả" },
  { ic: "🥕", en: "Vegetables", vi: "Rau củ", w:
    "🥦 vegetables=rau; 🥕 carrot=củ cà rốt; 🥔 potato=củ khoai tây; 🍅 tomato=quả cà chua; 🥦 broccoli=súp lơ xanh; 🌽 corn=bắp ngô; 🥒 cucumber=dưa chuột; 🧅 onion=củ hành; 🧄 garlic=củ tỏi^2; 🥬 cabbage=bắp cải; 🌶️ chili=quả ớt; 🎃 pumpkin=quả bí ngô; 🍄 mushroom=cây nấm; 🍠 sweet potato=khoai lang^2; 🍆 eggplant=cà tím^2" },
  { ic: "🍚", en: "Meals and snacks", vi: "Bữa ăn và đồ ăn vặt", w:
    "🍱 food=đồ ăn; 🍚 rice=cơm; 🍞 bread=bánh mì; 🍜 noodles=mì; 🍜 pho=phở; 🥚 egg=quả trứng; 🥩 meat=thịt; 🍗 chicken=thịt gà; 🍗 fried chicken=gà rán; 🐟 fish=cá; 🍟 chips=khoai tây chiên; 🍕 pizza=bánh pizza; 🍔 hamburger=bánh hamburger; 🌭 hot dog=bánh mì xúc xích; 🥪 sandwich=bánh mì kẹp; 🍲 soup=món canh, súp; 🥟 dumpling=bánh bao, há cảo^2; 🧀 cheese=phô mai; 🥜 nuts=các loại hạt; 🍯 honey=mật ong; 🍓 jam=mứt; 🥨 salt=muối; 🍳 breakfast=bữa sáng; 🍱 lunch=bữa trưa; 🍽️ dinner=bữa tối" },
  { ic: "🍰", en: "Sweets", vi: "Đồ ngọt", w:
    "🍰 cake=bánh ngọt; 🍬 candy=kẹo; 🍭 lollipop=kẹo mút; 🍫 chocolate=sô-cô-la; 🍦 ice cream=kem; 🍪 cookie=bánh quy; 🍩 doughnut=bánh vòng; 🍿 popcorn=bỏng ngô; 🥞 pancake=bánh kếp^2; 🧁 cupcake=bánh nướng nhỏ; 🎂 birthday cake=bánh sinh nhật" },
  { ic: "🥛", en: "Drinks", vi: "Đồ uống", w:
    "💧 water=nước; 🥛 milk=sữa; 🧃 juice=nước ép; 🍋 lemonade=nước chanh; 🍵 tea=trà; ☕ coffee=cà phê; 🥤 soda=nước ngọt có ga^2; 🥤 milk tea=trà sữa; 🥥 coconut juice=nước dừa; 🥤 drink=uống" },
  { ic: "😋", en: "Tastes", vi: "Vị và cảm nhận món ăn", w:
    "😋 yummy=ngon; 🤢 yucky=dở, ghê; 🤤 delicious=rất ngon; 🍬 sweet=ngọt; 🍋 sour=chua; 🧂 salty=mặn; ☕ bitter=đắng; 🌶️ spicy=cay; 🥨 crunchy=giòn; 🍞 soft=mềm; 🥜 hard=cứng; 🔥 hot=nóng; 🧊 cold=lạnh; 👍 I like it=con thích; 👎 I don't like it=con không thích" },
  { ic: "😋", en: "Eating words", vi: "Từ chỉ việc ăn uống", nm: 1, w:
    "😋 eat=ăn; 🥤 drink=uống; 🍎 bite=cắn; 😋 chew=nhai; 🌬️ blow=thổi; 🍦 lick=liếm; 🐭 nibble=gặm (chuột, thỏ); 🐔 peck=mổ; 🦴 gnaw=gặm (chó); 🍵 sip=nhấp, uống từng ngụm; 🍜 slurp=húp sụp; 😮 swallow=nuốt; 🥛 pour=rót; 🍌 peel=bóc vỏ; 🍳 cook=nấu ăn" }
]},

{ id: "home", ic: "🏠", en: "Home and things", vi: "Nhà và đồ vật", topics: [
  { ic: "🏠", en: "My house", vi: "Ngôi nhà của con", w:
    "🏠 house=ngôi nhà; 🏠 home=nhà; 🏢 flat=căn hộ; 🛌 bedroom=phòng ngủ; 🛁 bathroom=phòng tắm; 🍳 kitchen=nhà bếp; 🛋️ living room=phòng khách; 🍽️ dining room=phòng ăn; 🌷 garden=khu vườn; 🚪 door=cửa ra vào; 🔲 window=cửa sổ; 🚧 gate=cái cổng; 🧱 wall=bức tường^2" },
  { ic: "🛋️", en: "Things at home", vi: "Đồ vật trong nhà", w:
    "🛏️ bed=cái giường; 🪑 chair=cái ghế; 🪑 table=cái bàn; 🪑 desk=bàn học; 💡 lamp=cái đèn; 🗄️ shelf=cái kệ; 🛋️ sofa=ghế sô-pha; 📺 TV=ti vi; 🕰️ clock=đồng hồ; 🛏️ pillow=cái gối; 🛏️ blanket=cái chăn; 📱 phone=điện thoại; 💻 computer=máy tính; 📦 box=cái hộp; 🔑 key=chìa khóa; 🔒 lock=ổ khóa; 🧹 mop=cây lau nhà; 🧹 broom=cái chổi; 🕯️ candle=cây nến; 🖼️ picture=bức tranh; 🎁 present=món quà; 🎈 balloon=bóng bay; ☂️ umbrella=cái ô" },
  { ic: "🍽️", en: "In the kitchen", vi: "Đồ dùng nhà bếp", w:
    "☕ cup=cái cốc; 🥣 bowl=cái bát; 🍽️ plate=cái đĩa; 🥄 spoon=cái thìa; 🍴 fork=cái dĩa; 🔪 knife=con dao^2; 🥢 chopsticks=đôi đũa; 🍲 pot=cái nồi; 🍳 pan=cái chảo^2; 🥫 can=cái lon; 🍼 bottle=cái chai, bình sữa; 🧊 fridge=tủ lạnh" },
  { ic: "🛁", en: "In the bathroom", vi: "Trong phòng tắm", w:
    "🧼 soap=xà phòng; 🧺 towel=khăn tắm; 🦷 toothbrush=bàn chải đánh răng; 🧴 toothpaste=kem đánh răng; 🛁 bath=bồn tắm; 🚿 shower=vòi hoa sen; 🚽 toilet=nhà vệ sinh; 🧽 sponge=miếng bọt biển^2" },
  { ic: "🧹", en: "Helping at home", vi: "Giúp việc nhà", w:
    "🧹 clean up=dọn dẹp; 🧹 clean the floor=lau nhà; 🍽️ wash the dishes=rửa bát; 👕 wash the clothes=giặt quần áo; 💧 water the plants=tưới cây; 🍳 help with the cooking=phụ nấu ăn; 🍲 cook meals=nấu các bữa ăn; 🏠 do housework=làm việc nhà; 🛏️ make the bed=dọn giường^2; 🐶 feed the dog=cho chó ăn^2; 🧼 wash=rửa" }
]},

{ id: "clothes", ic: "👕", en: "Clothes", vi: "Quần áo", topics: [
  { ic: "👕", en: "Clothes", vi: "Quần áo", w:
    "👕 T-shirt=áo phông; 👔 shirt=cái áo; 👗 dress=váy; 👗 skirt=chân váy; 👖 pants=quần dài; 🩳 shorts=quần soóc; 🧥 jacket=áo khoác; 🧥 coat=áo khoác dày; 🧣 scarf=khăn quàng; 🧤 gloves=găng tay; 🩱 swimsuit=đồ bơi^2; 🛌 pyjamas=đồ ngủ^2; 👕 clothes=quần áo" },
  { ic: "👟", en: "Hats, shoes and more", vi: "Mũ, giày và đồ dùng", w:
    "👒 hat=cái mũ; 🧢 cap=mũ lưỡi trai; 👟 shoes=đôi giày; 🧦 socks=đôi tất; 👢 boots=đôi ủng; 👡 sandals=dép xăng-đan^2; 🕶️ sunglasses=kính râm; 👓 glasses=kính mắt; 🎒 bag=cái cặp, cái túi; 👜 handbag=túi xách^2; ⌚ watch=đồng hồ đeo tay^2; ☂️ umbrella=cái ô; 🎭 mask=mặt nạ" },
  { ic: "🧥", en: "Get dressed", vi: "Mặc quần áo", nm: 1, w:
    "🧥 put on=mặc vào; 👕 take off=cởi ra; 👔 button=cài cúc^3; 👟 tie my shoes=buộc dây giày^2; 👚 new=mới; 🧸 old=cũ; 🧼 clean=sạch; 💩 dirty=bẩn; 💦 wet=ướt; ☀️ dry=khô" }
]},

{ id: "school", ic: "🏫", en: "School", vi: "Trường học", topics: [
  { ic: "🏫", en: "At school", vi: "Ở trường", w:
    "🏫 school=trường học; 🏫 classroom=lớp học; 👩‍🏫 teacher=cô giáo; 🧒 friend=bạn; 🎠 playground=sân chơi; 📚 library=thư viện; 🏀 gym=phòng thể dục; 🎨 art room=phòng mĩ thuật; 🎵 music room=phòng âm nhạc; 💻 computer room=phòng máy tính; 🍽️ canteen=nhà ăn; 🔔 bell=cái chuông; 🟩 board=cái bảng; 🗓️ timetable=thời khóa biểu^2; 📝 homework=bài tập về nhà; 🎌 flag=lá cờ" },
  { ic: "✏️", en: "School things", vi: "Đồ dùng học tập", w:
    "📖 book=quyển sách; 📓 notebook=quyển vở; 🖊️ pen=bút mực; ✏️ pencil=bút chì; ✏️ pencil case=hộp bút; 🖍️ crayon=bút sáp màu; 🧽 eraser=cục tẩy; 📏 ruler=cái thước; 🎒 school bag=cặp sách; 🎒 bag=cái cặp; ✂️ scissors=cái kéo; 🧴 glue=hồ dán^2; 📄 paper=giấy; 🖌️ paintbrush=cây bút lông^2; 🖍️ colour pencils=bút chì màu^2; 🖼️ drawing=bức vẽ; 🪑 desk=bàn học; 🪑 chair=cái ghế" },
  { ic: "📚", en: "School subjects", vi: "Các môn học", w:
    "📚 subject=môn học; 🔢 maths=môn Toán; 🇬🇧 English=môn Tiếng Anh; 🇻🇳 Vietnamese=môn Tiếng Việt; 🔬 science=môn Khoa học; 🎨 art=môn Mĩ thuật; 🎵 music=môn Âm nhạc; 🤸 PE=môn Giáo dục thể chất; 💻 IT=môn Tin học^2; 🌏 history and geography=môn Lịch sử và Địa lí^3; ⭐ favourite=yêu thích nhất" },
  { ic: "🙋", en: "In class", vi: "Trong giờ học", nm: 1, w:
    "📖 open your book=mở sách ra; 📕 close your book=gấp sách lại; 🧍 stand up=đứng lên; 🪑 sit down=ngồi xuống; 🙋 raise your hand=giơ tay lên; 👂 listen=nghe; 👀 look=nhìn; 📚 read=đọc; ✍️ write=viết; 🎨 draw=vẽ; 🖌️ paint=tô màu, vẽ tranh; 👉 point=chỉ vào; ✊ hold=cầm; 🔢 count=đếm; 🎤 sing=hát; 🤫 be quiet=giữ trật tự^2; 🤝 share=chia sẻ, dùng chung" }
]},

{ id: "play", ic: "🧸", en: "Toys and play", vi: "Đồ chơi và vui chơi", topics: [
  { ic: "🧸", en: "Toys", vi: "Đồ chơi", w:
    "🧸 toy=đồ chơi; ⚽ ball=quả bóng; 🚗 car=ô tô; 🎎 doll=búp bê; 🧸 teddy bear=gấu bông; 🤖 robot=người máy; 🪁 kite=con diều; 🌀 top=con quay; 🪀 yo-yo=cái yo-yo; 🧩 puzzle=trò ghép hình; 🧱 blocks=bộ xếp hình; 🚂 train=tàu hỏa; ✈️ plane=máy bay; 🎈 balloon=bóng bay; 🦸 superhero=siêu anh hùng; 👾 monster=quái vật; 🎭 mask=mặt nạ; 🦖 dinosaur=khủng long; 🥁 drum=cái trống; 🎢 slide=cầu trượt^2; 🪀 swing=xích đu^2" },
  { ic: "⚽", en: "Sports", vi: "Thể thao", w:
    "⚽ football=bóng đá; ⚽ play football=đá bóng; 🏀 play basketball=chơi bóng rổ; 🏐 play volleyball=chơi bóng chuyền; 🏸 play badminton=chơi cầu lông; 🎾 play tennis=chơi quần vợt; 🏓 play table tennis=chơi bóng bàn; 🏊 swim=bơi; 🚲 ride a bike=đi xe đạp; 🐴 ride a horse=cưỡi ngựa; ⛸️ skate=trượt pa-tanh; ⛸️ roller skate=trượt pa-tanh; 🤸 skip=nhảy dây; 🧘 do yoga=tập yoga; 🏃 run a race=chạy đua; 🏆 win=thắng; 📣 cheer=cổ vũ; 🏟️ match=trận đấu; 🧑‍🤝‍🧑 team=đội; 🏅 sports day=ngày hội thể thao^2; 🏅 play sports=chơi thể thao" },
  { ic: "🎸", en: "Hobbies and fun", vi: "Sở thích", w:
    "🎸 play the guitar=chơi đàn ghi-ta; 🎹 play the piano=chơi đàn piano; 🎧 listen to music=nghe nhạc; 📺 watch TV=xem ti vi; 🎬 watch films=xem phim; 📖 read a book=đọc sách; 🎨 draw=vẽ; 🎤 sing=hát; 💃 dance=nhảy múa; ♟️ play chess=chơi cờ; 🙈 play hide-and-seek=chơi trốn tìm; 🙈 hide-and-seek=trốn tìm;🪁 fly a kite=thả diều; 📷 take a photo=chụp ảnh; 🃏 card games=trò chơi bài^2; 🤼 tug of war=kéo co^2; 🧩 do a puzzle=chơi ghép hình" },
  { ic: "🎉", en: "Parties and holidays", vi: "Tiệc và kì nghỉ", w:
    "🎉 party=bữa tiệc; 🎂 birthday=sinh nhật; 🎁 present=món quà; 🎈 balloon=bóng bay; 🕯️ candle=cây nến; 🧳 holiday=kì nghỉ; ⛺ summer camp=trại hè; ⛺ tent=cái lều; 🔥 campfire=lửa trại; 🏕️ campsite=khu cắm trại; 🏖️ beach=bãi biển; 🎊 fun=vui; 🎉 hooray=hoan hô" }
]},

{ id: "town", ic: "🚌", en: "Places and transport", vi: "Nơi chốn và phương tiện", topics: [
  { ic: "🏪", en: "Places in town", vi: "Các nơi trong thị trấn", w:
    "🏞️ zoo=sở thú; 🌳 park=công viên; 🧑‍🌾 farm=nông trại; 🛒 market=chợ; 🏬 supermarket=siêu thị; 🏪 shop=cửa hàng; 🥐 bakery=tiệm bánh; 📚 bookshop=hiệu sách; 🎬 cinema=rạp chiếu phim; 🏥 hospital=bệnh viện; 📮 post office=bưu điện; 📚 library=thư viện; 🏊 swimming pool=bể bơi; 💦 water park=công viên nước; 🏟️ sports centre=trung tâm thể thao; 🏬 shopping centre=trung tâm mua sắm; 🎁 gift shop=cửa hàng quà tặng; 🍢 food stall=quầy đồ ăn; 🏭 factory=nhà máy; 🏢 office=văn phòng; 🏡 nursing home=viện dưỡng lão; 🚏 bus stop=trạm xe buýt; 🏛️ museum=bảo tàng^2; 🍽️ restaurant=nhà hàng^2; 🏦 bank=ngân hàng^3; 🚓 police station=đồn công an^3; 🚒 fire station=trạm cứu hỏa^3; 🚸 road sign=biển báo" },
  { ic: "🚗", en: "Transport", vi: "Phương tiện giao thông", w:
    "🚗 car=ô tô; 🚌 bus=xe buýt; 🚚 truck=xe tải; 🚂 train=tàu hỏa; 🚲 bike=xe đạp; ✈️ plane=máy bay; ✈️ airplane=máy bay; ⛵ boat=con thuyền; 🚢 ship=con tàu; 🚒 fire truck=xe cứu hỏa; 🚕 taxi=xe taxi; 🏍️ motorbike=xe máy; 🚁 helicopter=trực thăng; 🚑 ambulance=xe cứu thương; 🚓 police car=xe cảnh sát; 🛴 scooter=xe trượt scooter; 🚜 tractor=máy cày; 🚀 rocket=tên lửa; 🚦 traffic lights=đèn giao thông^2" }
]},

{ id: "actions", ic: "🏃", en: "Actions", vi: "Hành động", topics: [
  { ic: "🤸", en: "I can move", vi: "Con biết vận động", nm: 1, w:
    "🤸 jump=nhảy; 🏃 run=chạy; 🏊 swim=bơi; 🦸 fly=bay; 🧗 climb=leo trèo; 💃 dance=nhảy múa; 🚶 walk=đi bộ; 🐰 hop=nhảy lò cò; 👶 crawl=bò; ⚽ kick=đá; 🤾 throw=ném^2; 🧤 catch=bắt (bóng)^2; 🤸 skip=nhảy dây; 🪑 sit down=ngồi xuống; 🧍 stand up=đứng lên; 👋 wave=vẫy tay; 🍂 fall=rơi, ngã; 🛑 stop=dừng lại; 🟢 go=đi; ⏳ wait=chờ, đợi; 🔄 turn around=quay một vòng" },
  { ic: "🗣️", en: "Everyday actions", vi: "Hành động hằng ngày", nm: 1, w:
    "😴 sleep=ngủ; 😋 eat=ăn; 🥤 drink=uống; 🗣️ talk=nói chuyện; 🎤 sing=hát; 🤹 play=chơi; 🤝 help=giúp đỡ; 🤝 share=chia sẻ, dùng chung; 🤗 hug=ôm; 😆 laugh=cười to; 😊 smile=mỉm cười; 😭 cry=khóc; 📢 shout=hét to; 🤫 whisper=nói thầm; 👀 look=nhìn; 👀 see=nhìn thấy; 👂 listen=nghe; 📺 watch=xem; 🔎 find=tìm thấy; 👍 like=thích; ❤️ love=yêu thương; 🙏 want=muốn; 🏠 live=sống; 🧼 wash=rửa; 🎁 give=cho, tặng^2; 🚪 open=mở; 🚪 close=đóng" },
  { ic: "⏰", en: "My day", vi: "Một ngày của con", w:
    "⏰ wake up=thức dậy; ⏰ wakes up=thức dậy; 🛌 goes to bed=đi ngủ; 🛁 takes a bath=tắm;⏰ get up=thức dậy; 🦷 brush my teeth=đánh răng; 🧼 wash my face=rửa mặt; 🥣 eat breakfast=ăn sáng; 🥣 have breakfast=ăn sáng; 🏫 go to school=đi học; 📚 study at school=học ở trường; 🍱 have lunch=ăn trưa; 🏠 go home=về nhà; 📝 do homework=làm bài tập về nhà; 🍽️ have dinner=ăn tối; 🛁 take a bath=tắm; 📖 read a book=đọc sách; 🛌 go to bed=đi ngủ; 👵 visit my grandparents=thăm ông bà" },
  { ic: "🏕️", en: "What are they doing?", vi: "Các bạn đang làm gì?", nm: 1, w:
    "💃 dancing beautifully=múa đẹp^3; 🦁 roaring loudly=gầm to^3; 🏃 running quickly=chạy nhanh^3; 🐦 singing merrily=hót vui vẻ^3; 🔥 building a campfire=đang đốt lửa trại^3; 💃 dancing around the campfire=đang nhảy quanh lửa trại^3; 🃏 playing card games=đang chơi bài^3; 🤼 playing tug of war=đang kéo co^3; ⛺ putting up a tent=đang dựng lều^3; 🎤 singing songs=đang hát^3; 📷 taking a photo=đang chụp ảnh^3; 📖 telling a story=đang kể chuyện^3; 🏊 swimming in the lake=đang bơi trong hồ^3; 🎨 drawing a picture=đang vẽ tranh^3; 📚 reading a book=đang đọc sách^3" }
]},

{ id: "colors", ic: "🎨", en: "Colors and describing", vi: "Màu sắc và từ miêu tả", topics: [
  { ic: "🌈", en: "Colors", vi: "Màu sắc", w:
    "🎨 color=màu sắc; c:#E53935 red=màu đỏ; c:#1E88E5 blue=màu xanh dương; c:#FDD835 yellow=màu vàng; c:#43A047 green=màu xanh lá; c:#FB8C00 orange=màu cam; c:#8E24AA purple=màu tím; c:#F06292 pink=màu hồng; c:#9E9E9E gray=màu xám; c:#795548 brown=màu nâu; c:#212121 black=màu đen; c:#FFFFFF white=màu trắng; c:#D4AF37 gold=màu vàng kim^2; c:#C0C0C0 silver=màu bạc^2; 🌈 rainbow=cầu vồng" },
  { ic: "✨", en: "Describing words", vi: "Từ miêu tả", nm: 1, w:
    "✨ new=mới; 🧸 old=cũ; 🧼 clean=sạch; 💩 dirty=bẩn; 🌸 pretty=đẹp, xinh; 🦚 beautiful=rất đẹp; 👹 ugly=xấu; ⚡ fast=nhanh; 🐢 slow=chậm; 📢 loud=to, ồn; 🤫 quiet=yên tĩnh; 📢 noisy=ồn ào; 🏙️ busy=đông đúc, nhộn nhịp; 🧱 hard=cứng; 🧸 soft=mềm; 💦 wet=ướt; ☀️ dry=khô; 🤢 smelly=hôi; 🥰 cute=đáng yêu; 😂 funny=vui tính; 🌟 nice=ngon, đẹp, tốt; 🎊 fun=vui; 🐭 little=nhỏ bé; 🔢 many=nhiều; 💪 strong=khỏe; 🦁 brave=dũng cảm; ⭐ favourite=yêu thích nhất" }
]},

{ id: "time", ic: "🕐", en: "Time", vi: "Thời gian", topics: [
  { ic: "🌅", en: "Times of day", vi: "Các buổi trong ngày", w:
    "🌅 morning=buổi sáng; 🌅 in the morning=vào buổi sáng; 🕛 at noon=vào buổi trưa; 🌇 in the afternoon=vào buổi chiều; 🌆 in the evening=vào buổi tối; 🌙 night=buổi tối, ban đêm; 📅 today=hôm nay; ⏪ yesterday=hôm qua; ⏩ tomorrow=ngày mai^2; 🗓️ weekend=cuối tuần; ⏪ last weekend=cuối tuần trước; ⏪ last summer=mùa hè năm ngoái" },
  { ic: "🕐", en: "Telling the time", vi: "Xem giờ", w:
    "🕰️ clock=đồng hồ; 🕐 o'clock=giờ đúng; ⏰ hour=giờ^2; ⏱️ minute=phút^2; n:15 fifteen=mười lăm (phút); n:30 thirty=ba mươi (phút); n:45 forty-five=bốn mươi lăm (phút)^2; 🕧 half past=rưỡi^3; ❓ what time=mấy giờ^2" },
  { ic: "📅", en: "Days of the week", vi: "Các ngày trong tuần", w:
    "📅 Monday=thứ Hai^2; 📅 Tuesday=thứ Ba^2; 📅 Wednesday=thứ Tư^2; 📅 Thursday=thứ Năm^2; 📅 Friday=thứ Sáu^2; 📅 Saturday=thứ Bảy^2; 📅 Sunday=Chủ nhật^2; 🗓️ week=tuần^2" },
  { ic: "🗓️", en: "Months of the year", vi: "Các tháng trong năm", w:
    "🗓️ January=tháng Một^3; 🗓️ February=tháng Hai^3; 🗓️ March=tháng Ba^3; 🗓️ April=tháng Tư^3; 🗓️ May=tháng Năm^3; 🗓️ June=tháng Sáu^3; 🗓️ July=tháng Bảy^3; 🗓️ August=tháng Tám^3; 🗓️ September=tháng Chín^3; 🗓️ October=tháng Mười^3; 🗓️ November=tháng Mười Một^3; 🗓️ December=tháng Mười Hai^3; 🗓️ month=tháng^2; 🎆 year=năm^2" }
]},

{ id: "talk", ic: "💬", en: "Talk words", vi: "Từ và câu để nói chuyện", topics: [
  { ic: "👋", en: "Hello and be polite", vi: "Chào hỏi và lịch sự", nm: 1, w:
    "👋 hello=xin chào; 🙋 hi=chào; 🙋 bye=tạm biệt; 🚶 goodbye=tạm biệt; 🌞 good morning=chào buổi sáng; 🌙 good night=chúc ngủ ngon; 🤝 nice to meet you=rất vui được gặp bạn; 👋 see you later=hẹn gặp lại; 🙏 please=làm ơn; 💐 thank you=cảm ơn; 😔 sorry=xin lỗi; 👌 that's okay=không sao đâu; 🎁 here you are=của bạn đây; 🩹 are you okay?=bạn có sao không?; 😣 ouch=ối, đau quá" },
  { ic: "🤝", en: "Let's play together", vi: "Chơi cùng nhau", nm: 1, w:
    "🙋 can I play?=tớ chơi cùng được không?; 🤹 let's play!=cùng chơi nào!; 👆 my turn=lượt của tớ; 👉 your turn=lượt của bạn; 👍 good job!=giỏi lắm!; 🎉 hooray=hoan hô; ✅ yes=có, vâng; ❌ no=không; 👍 I like it=con thích; 👎 I don't like it=con không thích" },
  { ic: "❓", en: "Question words", vi: "Từ để hỏi", nm: 1, w:
    "❓ what=cái gì; ❓ where=ở đâu; 🧑 who=ai; ❓ why=tại sao; 💡 because=bởi vì; 🔢 how many=bao nhiêu; 🎂 how old=bao nhiêu tuổi; 🕐 what time=mấy giờ^2; 🎨 what color=màu gì; 🔷 what shape=hình gì; 🏷️ how much=giá bao nhiêu^2" }
]}

]};
