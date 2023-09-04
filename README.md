# Gamedo
This is largest JavaScript project I have been working on. I started it in march 2021. It is a 3d game level editor written in JavaScript. Is uses WebGL to display 3d graphics with GPU acceleration in web browser. It is made with [THREE.js](https://threejs.org) with no other dependecies. The interface is in pure DOM (I would probably used React today:)). The server side is written in PHP and uses MySQL database.
![002b](https://github.com/zbigniew54/Gamedo/assets/132487185/01511243-1724-4419-996b-92fd76674f98)


![002a](https://github.com/zbigniew54/Gamedo/assets/132487185/5aab22eb-5151-4f06-8030-68459bf85c6b)


# Procedural 3d worlds
Its best feature is fully automatic building of procedural and randomized 3d environments for 3d games. Mostly for top-down games like TPP adventure games or strategies etc. Below you can see auto-generated level plan that is filled with meshes in next step (next screen) to create final game level.

<img width="959" alt="20" src="https://github.com/zbigniew54/Gamedo/assets/132487185/4c7a91aa-7bb5-44dc-88d9-1f3b66d2bd1d">

_Level plan with fields: room (yellow color), corridor (orange), roof (blue), hole (brown) _

![21](https://github.com/zbigniew54/Gamedo/assets/132487185/1ef4c188-2020-407e-b822-b2862bdda2aa)
_Build level_

# How it works
First you make a 2d plan. You mark fields witch are about to serve as a room (yellow color), corridor (orange), roof (blue), hole (brown) etc. Then you pick **modules**. These are 3d meshes that are used to build the level. They are main building blocks, and can be assigned many categories like floor (flat tile that fills room or corridor fields), wall (vertical mesh to separe room with roof or room with hole), and many others like obstacles and decorations (randomly scattered on any field type).

![08](https://github.com/zbigniew54/Gamedo/assets/132487185/8e968619-a9a1-4d61-b2af-608c4a7601f1)
_Wall and floor modules_

Its not that easy to build a 3d level with flat floor tiles or walls. Its gets tricky when you have to handle corners (convex or concave). This software can automatically create corners (an event columns) from "flat" walls

![011a](https://github.com/zbigniew54/Gamedo/assets/132487185/2a68a5eb-2d78-4807-95a9-5c1468b8b4e5)
_Convex corner generated automatically from wall module_

![011b](https://github.com/zbigniew54/Gamedo/assets/132487185/5f6f7f65-14af-42bc-b37b-e362792c13da)
_All vertices and triangles are correctly cut_

![012](https://github.com/zbigniew54/Gamedo/assets/132487185/619d1ee8-4490-4320-a759-519edd46e670)
_You could use the same floor tile anywhere but to create nice looking corridors it is better to align tiles to walls. This requires to create corner modules for floors too and it requirest to place them in the scene correctly._

User can create levels by manually placing fields or "Dungeon" tool can be used to automatically generate level consisting of rooms connected with corridors. 

<img width="959" alt="010a" src="https://github.com/zbigniew54/Gamedo/assets/132487185/0057f1dc-6299-463e-9f0b-a2013e9d9c6d">

_"Dungeon" tool creates random levels. User only have to tweak parameters like level size, number of room, width of corridors etc_


<img width="960" alt="010b" src="https://github.com/zbigniew54/Gamedo/assets/132487185/cbf1d76c-0a23-4b65-9d68-570596060dc8">

_Level with fields filled with modules_

![23](https://github.com/zbigniew54/Gamedo/assets/132487185/fca87246-72be-46f3-92b5-4a0fec93d3fc)
_You can edit any object after it is placed in the scene_

# Physically Based Rendering (PBR)
![45](https://github.com/zbigniew54/Gamedo/assets/132487185/631e3e8f-cae1-4d81-b0d2-da613ca71b1c)
_Modern shaders implementing PBR (Physically Based Rendering)_

![44](https://github.com/zbigniew54/Gamedo/assets/132487185/6a88bb4e-9487-4167-88d3-640b8d604007)
_PBR makes metallic surfaces look realsitic_

![42](https://github.com/zbigniew54/Gamedo/assets/132487185/5bc8c512-f16b-415b-ba46-817fd324dd3e)
_HDR rendering with tone mapping and selective bloom_

<img width="960" alt="004" src="https://github.com/zbigniew54/Gamedo/assets/132487185/c7235b5e-fc04-4179-9214-c66a51a503a9">

_Material manager allows you to edit various parameters of shaders used to render meshes. Apart from standard PBR materials there are other available to render realistic water, glass, transparent surfaces and particles._

# Future work
Procedural flying cities :)

![31](https://github.com/zbigniew54/Gamedo/assets/132487185/a7b04b3b-9f20-4719-86b5-9862036c3a45)

