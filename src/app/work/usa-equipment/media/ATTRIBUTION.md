# Photography credits

Every photograph in this folder comes from [Wikimedia Commons](https://commons.wikimedia.org)
and is used under a free licence. They are **self-hosted, not hotlinked**: the
demo makes no third-party request, it still works with no network, and a static
`import` gives Next the file's real dimensions at build time.

Each file has been cropped to 3:2 and re-encoded. Under the share-alike terms,
those crops are offered under the same licence as the photograph they came from.

## What these pictures are, and are not

They are **stand-ins of the right machine type**, not portraits of the units in
`data.ts`. The light tower shown against `LT-2214` is a light tower; it is not
that Allmand. The demo says so on every unit page and in the footer, because a
rental customer choosing a machine from a photograph of a different machine is
exactly the kind of quiet lie this build is trying not to tell.

Four units carry no photograph at all — the Bomag reclaimer, the surface-cleaner
attachment and both mixers — because no correct picture was available. Those
fall back to a labelled slot rather than borrowing something close enough.

## Credits

| File                   | Source                                                                                                                                                                   | Author                 | Licence                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------------------------- |
| `yard.jpg`             | [Böhrer Baumaschinen 2023.jpg](https://commons.wikimedia.org/wiki/File:B%C3%B6hrer_Baumaschinen_2023.jpg)                                                                | Granpar                | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0)        |
| `light-tower.jpg`      | [Wacker Neuson LTN5, Güsen 01.jpg](https://commons.wikimedia.org/wiki/File:Wacker_Neuson_LTN5,_G%C3%BCsen_01.jpg)                                                        | Georgfotoart           | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |
| `light-tower-2.jpg`    | [Magnum mobile light tower in the Supreme Court parking lot.jpg](https://commons.wikimedia.org/wiki/File:Magnum_mobile_light_tower_in_the_Supreme_Court_parking_lot.jpg) | Ser Amantio di Nicolao | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |
| `generator.jpg`        | [Kohler backup power system.jpg](https://commons.wikimedia.org/wiki/File:Kohler_backup_power_system.jpg)                                                                 | Cantons-de-l'Est       | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| `roller.jpg`           | [Bomag Tandem Roller 02.JPG](https://commons.wikimedia.org/wiki/File:Bomag_Tandem_Roller_02.JPG)                                                                         | Cherubino              | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |
| `plate-compactor.jpg`  | [BOMAG BPR 70 70 D Reversible Vibratory Plates machine (1).jpg](<https://commons.wikimedia.org/wiki/File:BOMAG_BPR_70_70_D_Reversible_Vibratory_Plates_machine_(1).jpg>) | Peulle                 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |
| `rammer.jpg`           | [Stampfer seitlich Ammann.JPG](https://commons.wikimedia.org/wiki/File:Stampfer_seitlich_Ammann.JPG)                                                                     | Mailtosap              | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |
| `pressure-washer.jpg`  | [Sealey PC2952 Pressure Washer (4295125564).jpg](<https://commons.wikimedia.org/wiki/File:Sealey_PC2952_Pressure_Washer_(4295125564).jpg>)                               | Mark Hunter            | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0)        |
| `pump.jpg`             | [Hannibal 5000-1.jpg](https://commons.wikimedia.org/wiki/File:Hannibal_5000-1.jpg)                                                                                       | Florian Schäffer       | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |
| `boom-lift.jpg`        | [Genie Z-30-20N articulated boom lift.jpg](https://commons.wikimedia.org/wiki/File:Genie_Z-30-20N_articulated_boom_lift.jpg)                                             | Grendelkhan            | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0)  |
| `air-compressor.jpg`   | [Building Fairs Brno 2011 (004).jpg](<https://commons.wikimedia.org/wiki/File:Building_Fairs_Brno_2011_(004).jpg>)                                                       | Pavel Ševela           | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0)  |
| `air-compressor-2.jpg` | [Irmer + Elze IrmAir 5.5.jpg](https://commons.wikimedia.org/wiki/File:Irmer_%2B_Elze_IrmAir_5.5.jpg)                                                                     | Reise Reise            | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)  |

## Replacing them

Drop a new file in this folder and update the matching entry in the `PHOTOS`
map at the top of [`../data.ts`](../data.ts). The alt text lives beside each
import, so it is hard to change a picture and forget its description. When the
yard supplies its own photography, delete this file along with the stock images.
