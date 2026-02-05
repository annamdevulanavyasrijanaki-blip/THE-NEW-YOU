
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Search, ChevronRight, Sparkles, ArrowLeft, X, FileBadge, Globe
} from 'lucide-react';
import { Button, FadeIn, LoadingOverlay } from '../components/Components';
import { Product } from '../types';

/**
 * THE VERIFIED STATIC STYLE REGISTRY
 */
const STYLE_REGISTRY: Record<string, { image: string, desc: string }> = {
  // JEANS
  'Skinny Jeans': { image: 'https://i.pinimg.com/736x/4a/dc/ba/4adcba845cb268eee38d4ded80d1f191.jpg', desc: 'High-waisted skinny jeans in a classic mid-blue denim wash.' },
  'Straight Fit Jeans': { image: 'https://i.pinimg.com/1200x/3c/08/00/3c0800da2dd56a48bcb7c3f680c6510f.jpg', desc: 'Timeless straight-leg cut providing a balanced, clean aesthetic.' },
  'Slim Fit Jeans': { image: 'https://i.pinimg.com/736x/4a/dc/ba/4adcba845cb268eee38d4ded80d1f191.jpg', desc: 'Sleek slim-fit denim tailored for a modern silhouette.' },
  'Mom Jeans': { image: 'https://i.pinimg.com/1200x/62/34/94/62349402fc50047d82f127b4343f153d.jpg', desc: 'Retro-inspired high-waisted denim with a relaxed tapered leg.' },
  'Boyfriend Jeans': { image: 'https://i.pinimg.com/1200x/c4/26/6c/c4266c0750f474241651e167ad28ce2f.jpg', desc: 'Relaxed, slouchy denim for an effortless off-duty look.' },
  'Girlfriend Jeans': { image: 'https://i.pinimg.com/736x/81/9d/b2/819db21bce260b661be239d4392422ea.jpg', desc: 'A more feminine take on the boyfriend fit with a slimmer leg.' },
  'Bootcut Jeans': { image: 'https://i.pinimg.com/1200x/ee/7c/2f/ee7c2f2987b933df5e91187bf45abf2f.jpg', desc: 'Vintage-style bootcut jeans flared perfectly at the hem.' },
  'Flared Jeans': { image: 'https://i.pinimg.com/736x/04/7b/65/047b65a75b7370d90d2235105c17d674.jpg', desc: 'Dramatic 70s inspired flares with a modern high-rise fit.' },
  'Wide-Leg Jeans': { image: 'https://i.pinimg.com/1200x/b0/c1/d3/b0c1d3c718bf35cef901583d349bbf00.jpg', desc: 'Ultra-contemporary wide-leg denim providing a fluid drape.' },
  'High-Waist Jeans': { image: 'https://i.pinimg.com/1200x/0a/49/62/0a4962ca3fbdc4010d88bfbf221c4869.jpg', desc: 'Structural high-rise denim designed to define the waist.' },
  'Mid-Rise Jeans': { image: 'https://i.pinimg.com/1200x/bf/95/77/bf95772e96f7e51ea5e67d691b88ffd5.jpg', desc: 'Versatile mid-rise jeans for everyday comfort and style.' },
  'Low-Rise Jeans': { image: 'https://i.pinimg.com/736x/85/35/51/85355137b9fe74d7bde56200f04ba3bd.jpg', desc: 'Y2K inspired low-rise denim for a bold silhouette.' },
  'White Jeans': { image: 'https://i.pinimg.com/1200x/31/20/3f/31203f14f674fe63947e7754f01ef964.jpg', desc: 'Crisp white denim for a clean, sophisticated aesthetic.' },
  'Ripped Jeans': { image: 'https://i.pinimg.com/736x/45/98/b1/4598b1d55ea7d0a5f527dd1cb3176819.jpg', desc: 'Distressed denim with precision-placed rips for an edgy look.' },
  'Cropped Jeans': { image: 'https://i.pinimg.com/1200x/60/b3/d8/60b3d8534e2eee75b58c8fbfb678702e.jpg', desc: 'Ankle-grazing denim perfect for showcasing footwear.' },
  'Cargo Jeans': { image: 'https://i.pinimg.com/1200x/16/9e/94/169e94d64b35fbfe2f2e3600b92dbf5f.jpg', desc: 'Utilitarian-inspired denim with functional side pockets.' },
  'Denim Joggers': { image: 'https://i.pinimg.com/1200x/54/e7/1f/54e71feb853e02e53389b1aa3d1af7de.jpg', desc: 'Hybrid denim with an elasticated waist for maximum comfort.' },

  // TOPS & T-SHIRTS
  'Regular T-Shirts': { image: 'https://i.pinimg.com/1200x/36/f4/21/36f4216958a8f5da6a4f7cb551e9d30e.jpg', desc: 'Premium heavy cotton crew neck staple.' },
  'Oversized T-Shirts': { image: 'https://i.pinimg.com/736x/a7/80/49/a78049298600d6d0108ffaebb3c55876.jpg', desc: 'Relaxed fit drop-shoulder silhouette in organic cotton.' },
  'Crop Tops': { image: 'https://i.pinimg.com/736x/1c/52/f2/1c52f2ec3226da52f1374da5d4d33b9f.jpg', desc: 'Minimalist chic crop top with a ribbed finish.' },
  'Tank Tops': { image: 'https://i.pinimg.com/736x/16/52/ba/1652ba28cdb7c3817d9667b3f00ee45b.jpg', desc: 'Essential cotton tank top for layering or solo wear.' },
  'Camisoles': { image: 'https://i.pinimg.com/1200x/a6/32/be/a632bea2cc1d21fb41fa37b7695e9f6a.jpg', desc: 'Delicate silk camisole with adjustable spaghetti straps.' },
  'Off-Shoulder Tops': { image: 'https://i.pinimg.com/736x/95/90/01/9590013cd0039693f8645bf51d615565.jpg', desc: 'Elegant off-the-shoulder design for a romantic look.' },
  'One-Shoulder Tops': { image: 'https://i.pinimg.com/1200x/88/82/da/8882dac714e75ca22e19abe4b1a2b90a.jpg', desc: 'Asymmetrical one-shoulder top for a sculptural finish.' },
  'Tube Tops': { image: 'https://i.pinimg.com/1200x/a8/f5/e5/a8f5e557e372eec1783359917f5ea7f8.jpg', desc: 'Sleek strapless tube top for minimalist styling.' },
  'Peplum Tops': { image: 'https://i.pinimg.com/736x/f9/e4/8b/f9e48b80c05129162bca920984f9406c.jpg', desc: 'Structured peplum top designed to accentuate the waist.' },
  'Halter Neck Tops': { image: 'https://i.pinimg.com/736x/4a/f0/65/4af065fdb838a7b89f8f6c454c47b8ab.jpg', desc: 'Sophisticated halter neck with a refined drape.' },
  'High-Neck Tops': { image: 'https://i.pinimg.com/1200x/5a/62/c2/5a62c2938baf7ec3e9f9a7a85b49c574.jpg', desc: 'Minimalist high-neck top in a premium rib-knit.' },
  'Button-Down Shirts': { image: 'https://i.pinimg.com/736x/e9/17/d1/e917d1b6ad0baea8c87a4065b8c23045.jpg', desc: 'Classic cotton button-down for a crisp, tailored look.' },
  'Wrap Tops': { image: 'https://i.pinimg.com/1200x/2d/60/75/2d6075fca914f5ed7fdbd5ea838d8ef2.jpg', desc: 'Feminine wrap top that provides a custom adjustable fit.' },
  'Graphic Tees': { image: 'https://i.pinimg.com/1200x/73/c9/6e/73c96e744d759cdb1ef5fc545a74ec27.jpg', desc: 'Statement graphic tee with curated artistic prints.' },
  'Ribbed Tops': { image: 'https://i.pinimg.com/736x/bb/3e/f8/bb3ef809e1ea69b04bbb3fa0ae84fbc8.jpg', desc: 'Textured ribbed top for a body-sculpting finish.' },
  'Lace Tops': { image: 'https://i.pinimg.com/1200x/f5/8e/b7/f58eb76e015f979d8f3d7b2b19da210c.jpg', desc: 'Intricate floral lace top for elegant evening wear.' },

  // FORMALS
  'Formal Shirts': { image: 'https://i.pinimg.com/1200x/e0/ee/f5/e0eef57b0ef4a8e036f09bef7761912f.jpg', desc: 'Crisp white poplin button-down shirt for executive styling.' },
  'Blouses': { image: 'https://i.pinimg.com/1200x/74/7f/d4/747fd4ba0cca9e4b3d35c4e5d63cab0a.jpg', desc: 'Elegant silk blouse with delicate detailing.' },
  'Satin Shirts': { image: 'https://i.pinimg.com/1200x/1f/20/a3/1f20a3cb9a0015f67b9f229b97065b8f.jpg', desc: 'Lustrous satin shirt for a high-fashion formal look.' },
  'Oxford Shirts': { image: 'https://i.pinimg.com/1200x/6e/65/83/6e6583b049fb21d0e7ae77a3d25d7a0e.jpg', desc: 'Durable and classic Oxford weave shirt for professional wear.' },
  'Tie-Up Shirts': { image: 'https://i.pinimg.com/1200x/b3/32/53/b332534b852f79b07461659f8dc85486.jpg', desc: 'Chic shirt with an adjustable tie-front detail.' },
  'Pleated Shirts': { image: 'https://i.pinimg.com/1200x/e0/78/31/e07831fee0bd07f778912dccb9f0697f.jpg', desc: 'Intricate pleated details for a sophisticated texture.' },
  'Workwear Shirts': { image: 'https://i.pinimg.com/1200x/4f/17/52/4f1752d5891f9ce31aa8e11ff150c2a9.jpg', desc: 'Utility-focused professional shirt with clean lines.' },

  // BOTTOMWEAR
  'Formal Pants': { image: 'https://i.pinimg.com/736x/12/c6/99/12c6999507273553f58d2770f743d4ff.jpg', desc: 'Tailored formal pants with a sharp central crease.' },
  'Trousers': { image: 'https://i.pinimg.com/736x/cb/5f/66/cb5f662a291bbc94dbee403d719c65fc.jpg', desc: 'Wide-leg trousers for a sophisticated architectural look.' },
  'Cargo Pants': { image: 'https://i.pinimg.com/736x/cd/2d/f0/cd2df03db885ee4ef66a58cba65dec82.jpg', desc: 'Modern cargo pants with streamlined utility pockets.' },
  'Joggers': { image: 'https://i.pinimg.com/736x/b0/0e/fb/b00efb9fca00673721830bb0d921aec5.jpg', desc: 'Premium cotton joggers for elevated athleisure.' },
  'Leggings': { image: 'https://i.pinimg.com/1200x/95/5a/e9/955ae982df4d9905fb2602fbe61c4e15.jpg', desc: 'High-performance opaque leggings with a second-skin fit.' },
  'Jeggings': { image: 'https://i.pinimg.com/1200x/dd/c0/e6/ddc0e69ce9c761c23575f2e3651d7b80.jpg', desc: 'The comfort of leggings with the look of premium denim.' },
  'Palazzos': { image: 'https://i.pinimg.com/1200x/a4/1b/d1/a41bd181067fff2ca9d888a05c0e6f65.jpg', desc: 'Extra wide-leg palazzo pants for fluid movement.' },
  'Culottes': { image: 'https://i.pinimg.com/736x/35/d8/81/35d881dd5d28d70092211ec99be23991.jpg', desc: 'Cropped wide-leg culottes for contemporary styling.' },
  'Bootcut Trousers': { image: 'https://i.pinimg.com/1200x/f8/b8/0f/f8b80fd579b34c28f8404abb3923d0be.jpg', desc: 'Formal bootcut trousers that elongate the leg.' },
  'Paperbag Pants': { image: 'https://i.pinimg.com/1200x/c1/05/9c/c1059caf7d53b729c9f2b05bd2a15c62.jpg', desc: 'High-waisted pants with a cinchable paperbag waist.' },
  'Shorts': { image: 'https://i.pinimg.com/736x/08/98/83/08988374bc28e0b476e3d4287fea1f4c.jpg', desc: 'Tailored shorts for a refined warm-weather aesthetic.' },

  // WESTERN DRESSES
  'Bodycon Dress': { image: 'https://i.pinimg.com/736x/39/7d/b4/397db4811df90696b2818f656150878a.jpg', desc: 'Sleek form-fitting velvet bodycon dress.' },
  'A-Line Dress': { image: 'https://i.pinimg.com/736x/cb/55/ce/cb55ce50284cb6f71bd4c471de13f9a6.jpg', desc: 'Classic A-line silhouette that flares from the waist.' },
  'Fit & Flare Dress': { image: 'https://i.pinimg.com/1200x/9c/58/6b/9c586b52d15dda93e4216b3fc9d191a4.jpg', desc: 'Feminine dress with a fitted bodice and full skirt.' },
  'Slip Dress': { image: 'https://i.pinimg.com/1200x/41/a7/2a/41a72a2e70a89276fe71cbc6387fc1a8.jpg', desc: 'Champagne silk slip dress with delicate straps.' },
  'Maxi Dress': { image: 'https://i.pinimg.com/736x/80/83/0c/80830c8a51807ae7a5e6fa0369ad3d39.jpg', desc: 'Floral maxi dress with a fluid movement.' },
  'Midi Dress': { image: 'https://i.pinimg.com/736x/7b/47/07/7b470748e2886b58cea81d5dbecf2913.jpg', desc: 'Elegant midi-length dress for versatile styling.' },
  'Mini Dress': { image: 'https://i.pinimg.com/736x/2f/62/4a/2f624a8d419d33feb65fa8772a64ecc4.jpg', desc: 'Chic mini dress for a youthful, bold silhouette.' },
  'Shirt Dress': { image: 'https://i.pinimg.com/736x/14/ae/1e/14ae1e7adcf66fb838950fa27712f0c9.jpg', desc: 'Tailored shirt dress with a structured collar.' },
  'Wrap Dress': { image: 'https://i.pinimg.com/1200x/31/a9/48/31a948e545cdb3125c07fa806ea60a2e.jpg', desc: 'Timeless wrap dress that provides a flattering fit.' },
  'Off-Shoulder Dress': { image: 'https://i.pinimg.com/736x/ed/18/af/ed18afaa7d13796eebe3f1a0ca7ed622.jpg', desc: 'Romantic off-shoulder dress for special occasions.' },
  'One-Shoulder Dress': { image: 'https://i.pinimg.com/736x/84/c3/c8/84c3c8d25cc7f4bbe05ad84e98253b9b.jpg', desc: 'Modern one-shoulder dress with a sculptural drape.' },
  'Tube Dress': { image: 'https://i.pinimg.com/1200x/7b/08/6d/7b086d40f660f78ff743b3a8ee2adb9f.jpg', desc: 'Sleek strapless tube dress for a minimalist look.' },
  'Cocktail Dress': { image: 'https://i.pinimg.com/736x/21/46/7a/21467a04f2ee4c9371db1328c548e300.jpg', desc: 'Sophisticated cocktail dress for evening events.' },
  'Party Dress': { image: 'https://i.pinimg.com/736x/44/68/a6/4468a6ead3d8a18d65e2aa09a1b9956b.jpg', desc: 'High-energy party dress with statement details.' },
  'Skater Dress': { image: 'https://i.pinimg.com/1200x/0d/58/9d/0d589d60988acf798ae375dce84a6d52.jpg', desc: 'Playful skater dress with a circular skirt.' },
  'Ruffle Dress': { image: 'https://i.pinimg.com/736x/ba/44/33/ba4433293df88111250ec8fdac8277c4.jpg', desc: 'Textured ruffle dress with tiered detailing.' },
  'Bandage Dress': { image: 'https://i.pinimg.com/736x/e8/51/79/e851792514f5a1c299c029bc76214a9f.jpg', desc: 'Signature bandage dress for a sculpted fit.' },
  'Floral Dress': { image: 'https://i.pinimg.com/736x/ea/a3/09/eaa309e84b6a2bf2f9c2c003aa5f93bb.jpg', desc: 'Delicate floral print dress for a soft aesthetic.' },
  'Puff-Sleeve Dress': { image: 'https://i.pinimg.com/736x/7f/01/09/7f0109700c56a7956e6783efede250ab.jpg', desc: 'Statement puff-sleeve dress for a dramatic look.' },
  'Lace Dress': { image: 'https://i.pinimg.com/736x/9d/c7/11/9dc711ba7e8565b67ad1306a5d30a474.jpg', desc: 'Intricate lace overlay dress for elegant occasions.' },

  // TRADITIONAL WEAR
  'Sarees': { image: 'https://i.pinimg.com/736x/f0/41/f8/f041f87fb9fd927f49a1b4f480f51768.jpg', desc: 'Exquisite hand-woven saree with traditional gold zari.' },
  'Lehengas': { image: 'https://i.pinimg.com/736x/03/88/d1/0388d17c3cf49ca428d1ffc44605bb8b.jpg', desc: 'Intricately embroidered lehenga for a royal festive look.' },
  'Anarkali Suits': { image: 'https://i.pinimg.com/736x/a7/ae/46/a7ae467bf0dc085bbc315647c1522dea.jpg', desc: 'Flowing Anarkali suit with heavy gota patti work.' },
  'Sharara Sets': { image: 'https://i.pinimg.com/736x/f7/8d/b0/f78db02aa3849aa440b41af9d9de356b.jpg', desc: 'Modern sharara set with tiered flared bottoms.' },
  'Gharara Sets': { image: 'https://i.pinimg.com/1200x/13/49/fa/1349fadf20461cf93cff0cb3b124a3dd.jpg', desc: 'Traditional gharara with intricate handwork.' },
  'Punjabi Suits': { image: 'https://i.pinimg.com/736x/eb/00/34/eb00340d7acbcba9fb7d1f898dc4dc86.jpg', desc: 'Classic Punjabi salwar suit with vibrant embroidery.' },
  'Crop Top + Skirt Sets': { image: 'https://i.pinimg.com/736x/9c/fd/61/9cfd619f69d5b865daa2695a96225a27.jpg', desc: 'Indo-western crop top and ethnic skirt fusion.' },
  'Kurta Sets': { image: 'https://i.pinimg.com/1200x/39/19/cf/3919cf4b525cd89ad23ecf8ab5b1fc58.jpg', desc: 'Elegant kurta set with tailored straight pants.' },
  'Indo-Western Dresses': { image: 'https://i.pinimg.com/736x/0b/9f/cf/0b9fcf33ca1ab88c39b059e895e53a23.jpg', desc: 'Contemporary fusion dress with ethnic motifs.' },
  'Ethnic Gowns': { image: 'https://i.pinimg.com/1200x/0f/54/67/0f54671d46bbdcf9dca642e79b361f94.jpg', desc: 'Formal gown with traditional Indian embroidery.' },
  'Designer Blouses': { image: 'https://i.pinimg.com/1200x/a2/ef/70/a2ef70a03c95a2a3497da41ee427b15c.jpg', desc: 'Couture designer blouse with intricate hand-finishing.' },
  'Dupattas': { image: 'https://i.pinimg.com/736x/99/d5/33/99d5333486935b13df6b53f8f1dcc452.jpg', desc: 'Hand-painted silk dupatta to elevate any ensemble.' },
  'Ethnic Jackets': { image: 'https://i.pinimg.com/1200x/86/c1/c7/86c1c7554843e299d9706c2c927cb2e8.jpg', desc: 'Layered ethnic jacket with delicate threadwork.' },

  // FUSION & INDO-WESTERN
  'Jacket Dresses': { image: 'https://i.pinimg.com/736x/c1/3b/5c/c13b5ccbcb636d43e5c273ba3b9cae5b.jpg', desc: 'Formal dress layered with a structured fusion jacket.' },
  'Cape Sets': { image: 'https://i.pinimg.com/1200x/ef/3c/58/ef3c58e76c477f9daebcd8617da4bd80.jpg', desc: 'Elegant cape overlay with tailored fusion trousers.' },
  'Dhoti Pants': { image: 'https://i.pinimg.com/1200x/39/7e/55/397e55a61610c2c2baa74ae82a6f4457.jpg', desc: 'Modern dhoti-style pants for an avant-garde ethnic look.' },
  'Asymmetrical Dresses': { image: 'https://i.pinimg.com/1200x/06/a1/b9/06a1b92329ebf0508c20dcc03bf26351.jpg', desc: 'Fusion dress with a sculptural asymmetrical hemline.' },
  'Festive Co-ords': { image: 'https://i.pinimg.com/1200x/25/a9/cd/25a9cd6248eadc54352d9a97e1c5ea54.jpg', desc: 'Luxe co-ord set designed for contemporary festivities.' },

  // WINTER WEAR
  'Hoodies': { image: 'https://i.pinimg.com/736x/e5/ff/9f/e5ff9f93070ea849d0ec455b6c353c95.jpg', desc: 'Premium fleece hoodie for essential winter layering.' },
  'Sweatshirts': { image: 'https://i.pinimg.com/736x/d6/f1/1f/d6f11f35e4d110991f1bf678597055e0.jpg', desc: 'Minimalist sweatshirt in heavy organic cotton.' },
  'Knitted Sweaters': { image: 'https://i.pinimg.com/736x/ab/26/90/ab26903846d53dce70804b483ac70ffa.jpg', desc: 'Intricate knit sweater in a luxury wool blend.' },
  'Cardigans': { image: 'https://i.pinimg.com/736x/c9/16/75/c91675bce20f20f7534e0a6c502ffa90.jpg', desc: 'Soft-touch cardigan with a relaxed open front.' },
  'Trench Coats': { image: 'https://i.pinimg.com/1200x/3f/2b/4c/3f2b4cf988a0e89ab2f18212cce770fa.jpg', desc: 'Timeless trench coat with a structured silhouette.' },
  'Denim Jackets': { image: 'https://i.pinimg.com/736x/2d/46/10/2d4610a095560f52e472ca01045c767d.jpg', desc: 'Classic denim jacket with a vintage wash finish.' },
  'Leather Jackets': { image: 'https://i.pinimg.com/1200x/84/87/33/84873358af7215c4daf8a12447321202.jpg', desc: 'Premium black leather biker jacket with silver hardware.' },
  'Puffer Jackets': { image: 'https://i.pinimg.com/1200x/a5/ee/ae/a5eeaebd64b1670ca65c74b0b54ae9f2.jpg', desc: 'Quilted insulated puffer jacket for extreme comfort.' },

  // ACTIVEWEAR
  'Sports Bras': { image: 'https://i.pinimg.com/736x/7e/f7/99/7ef799006c568a10cbbb02278f0826a1.jpg', desc: 'High-impact sports bra with breathable mesh panels.' },
  'Gym Tees': { image: 'https://i.pinimg.com/1200x/91/e6/96/91e696c692170d5744e754b8e14fe0ee.jpg', desc: 'Moisture-wicking gym tee for peak performance.' },
  'Gym Leggings': { image: 'https://i.pinimg.com/1200x/e0/e0/62/e0e0627d42eb74babaccd166930d0746.jpg', desc: 'Compression gym leggings with a high-rise waist.' },
  'Yoga Pants': { image: 'https://i.pinimg.com/736x/99/93/33/999333640fff7fd2e0f4c15a6dfdae3c.jpg', desc: 'Flexible yoga pants designed for maximum mobility.' },
  'Sports Shorts': { image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800', desc: 'Lightweight sports shorts with an inner liner.' },
  'Trackpants': { image: 'https://i.pinimg.com/736x/af/1b/a8/af1ba8ac48cae54ce98b86d50c569bfb.jpg', desc: 'Tapered trackpants for athletics and recovery.' },
  'Running Sets': { image: 'https://i.pinimg.com/1200x/1d/13/2b/1d132b898dd6ed500f99cc442f322c7d.jpg', desc: 'Coordinated running set with reflective safety details.' },

  // FOOTWEAR
  'Sneakers': { image: 'https://i.pinimg.com/736x/45/9f/ab/459fab5e7b66f2cc247f8a13b838f92b.jpg', desc: 'Performance sneakers with advanced cushioning technology.' },
  'Loafers': { image: 'https://i.pinimg.com/736x/40/7f/41/407f41ebd79250be02f371231f25472f.jpg', desc: 'Premium leather loafers for polished formal attire.' },
  'Heels': { image: 'https://i.pinimg.com/736x/a2/0e/4d/a20e4d43b7af7fc8a86422c398b46a4d.jpg', desc: 'Elegant stilettos for high-fashion evening events.' },
  'Block Heels': { image: 'https://i.pinimg.com/736x/fc/da/38/fcda3854100f1eff2d171f82a9a09b79.jpg', desc: 'Sophisticated block heels for stability and style.' },
  'Boots': { image: 'https://i.pinimg.com/736x/d9/b8/f8/d9b8f8b22b3b68167487cb8ec7a0e5b5.jpg', desc: 'Structural boots tailored from premium calfskin.' },
  'Sandals': { image: 'https://i.pinimg.com/1200x/16/ae/86/16ae86bb021844dd86d6ca6c4dcd48e3.jpg', desc: 'Minimalist sandals with a cushioned footbed.' },
  'Sliders': { image: 'https://i.pinimg.com/736x/7f/2a/44/7f2a4407135df92a8c8573f1dabdac74.jpg', desc: 'Luxury slides for relaxed warm-weather comfort.' },
  'Running Shoes': { image: 'https://i.pinimg.com/736x/6c/da/3f/6cda3f63e6d9bf90b21c768ca3b5e3a4.jpg', desc: 'Engineered running shoes for high-mileage support.' },
  'Ethnic Footwear': { image: 'https://i.pinimg.com/736x/d2/a7/51/d2a751a55edd9392c6a71694221befe1.jpg', desc: 'Handcrafted juttis with traditional gold embroidery.' },

  // ACCESSORIES
  'Earrings': { image: 'https://i.pinimg.com/1200x/cb/3b/3d/cb3b3d81a17b2399194c38fa82af7ca7.jpg', desc: 'Sparkling diamond drop earrings to elevate any look.' },
  'Necklaces': { image: 'https://i.pinimg.com/1200x/7c/2c/c2/7c2cc2d46f49b1b536c69b7b42c69539.jpg', desc: 'Statement necklace with high-clarity gemstones.' },
  'Bracelets': { image: 'https://i.pinimg.com/1200x/06/36/71/0636712c97e74b5b895c8927806a9c31.jpg', desc: 'Minimalist gold cuff for sophisticated wristwear.' },
  'Watches': { image: 'https://i.pinimg.com/1200x/4d/36/3c/4d363c2cc1ce9a803e10c05a2f3036bc.jpg', desc: 'Precision-engineered timepiece with a luxury finish.' },
  'Sunglasses': { image: 'https://i.pinimg.com/1200x/e3/84/1f/e3841fb7611d9ca5babc54cbbefb4c98.jpg', desc: 'Architectural sunglasses with premium UV protection.' },
  'Belts': { image: 'https://i.pinimg.com/1200x/51/96/76/519676ef07d7c52779c803fa1da95197.jpg', desc: 'Timeless leather belt to cinch the waist.' },
  'Bags': { image: 'https://i.pinimg.com/1200x/e5/5d/e6/e55de6b4d3a200cbd27f792d11cd716c.jpg', desc: 'Structured leather handbag for everyday luxury.' },
  'Hair Accessories': { image: 'https://i.pinimg.com/1200x/2d/ae/f3/2daef35b0eef483f49dac7f9bc45d15f.jpg', desc: 'Elegant silk headbands and handcrafted clips.' },

  // OCCASION STYLES
  'College Wear': { image: 'https://i.pinimg.com/736x/76/d7/10/76d710a47969d3da77fbb1cc02f26ded.jpg', desc: 'Casual and creative looks for everyday campus style.' },
  'Office Wear': { image: 'https://i.pinimg.com/736x/50/fa/f9/50faf976fa909fe08c82a6c2087af5a5.jpg', desc: 'Sharp professional ensembles for the modern executive.' },
  'Party Wear': { image: 'https://i.pinimg.com/736x/cd/fa/49/cdfa4949cd0eb3245c356e080cc62da2.jpg', desc: 'High-impact looks designed for evening celebrations.' },
  'Wedding Wear': { image: 'https://i.pinimg.com/1200x/81/ee/ca/81eecac93ae4cde2186502d082f758a8.jpg', desc: 'Exquisite ensembles for high-society wedding events.' },
  'Festive Wear': { image: 'https://i.pinimg.com/1200x/db/c3/39/dbc339c9a0539825377499005f68ca0d.jpg', desc: 'Vibrant and traditional styles for cultural festivities.' },
  'Casual Looks': { image: 'https://i.pinimg.com/736x/1c/63/9a/1c639a98a9ed2907ce028f42927d86f6.jpg', desc: 'Relaxed and effortlessly chic outfits for daily wear.' },
  'Travel Outfits': { image: 'https://i.pinimg.com/736x/4e/eb/87/4eeb87bf5846416ea6b1118fc8cde99f.jpg', desc: 'Comfortable and stylish coordinates for the jetsetter.' },

  'default': { image: 'https://i.pinimg.com/736x/d9/f2/69/d9f269d53230946729677cbe8cdea04c.jpg', desc: 'Verified boutique asset from the archive.' }
};

const STORES = [
  { id: 'amazon', name: 'Amazon', color: 'bg-[#FF9900]', url: (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}` },
  { id: 'flipkart', name: 'Flipkart', color: 'bg-[#2874F0]', url: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}` },
  { id: 'myntra', name: 'Myntra', color: 'bg-[#FF3F6C]', url: (q: string) => `https://www.myntra.com/${encodeURIComponent(q).replace(/%20/g, '-')}` },
  { id: 'ajio', name: 'Ajio', color: 'bg-[#2C4152]', url: (q: string) => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}` },
  { id: 'meesho', name: 'Meesho', color: 'bg-[#F43397]', url: (q: string) => `https://www.meesho.com/search?q=${encodeURIComponent(q)}` },
  { id: 'google', name: 'Google', color: 'bg-[#4285F4]', url: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}` },
];

const CATEGORIES = [
  { id: 'jeans', name: 'Jeans', image: 'https://i.pinimg.com/736x/94/70/4a/94704a6bf16deca6ef2bba37c0ceaa6b.jpg', sub: ['Skinny Jeans', 'Straight Fit Jeans', 'Slim Fit Jeans', 'Mom Jeans', 'Boyfriend Jeans', 'Girlfriend Jeans', 'Bootcut Jeans', 'Flared Jeans', 'Wide-Leg Jeans', 'High-Waist Jeans', 'Mid-Rise Jeans', 'Low-Rise Jeans', 'White Jeans', 'Ripped Jeans', 'Cropped Jeans', 'Cargo Jeans', 'Denim Joggers'] },
  { id: 'tops', name: 'Tops & T-Shirts', image: 'https://i.pinimg.com/736x/6c/c2/0f/6cc20fc1186db89fb93f909127d6ab80.jpg', sub: ['Regular T-Shirts', 'Oversized T-Shirts', 'Crop Tops', 'Tank Tops', 'Camisoles', 'Off-Shoulder Tops', 'One-Shoulder Tops', 'Tube Tops', 'Peplum Tops', 'Halter Neck Tops', 'High-Neck Tops', 'Button-Down Shirts', 'Wrap Tops', 'Graphic Tees', 'Ribbed Tops', 'Lace Tops'] },
  { id: 'formals', name: 'Shirts & Formals', image: 'https://i.pinimg.com/1200x/ad/1e/a8/ad1ea841a8973e09d33d310b4da7578b.jpg', sub: ['Formal Shirts', 'Blouses', 'Satin Shirts', 'Oxford Shirts', 'Tie-Up Shirts', 'Pleated Shirts', 'Workwear Shirts'] },
  { id: 'bottomwear', name: 'Bottomwear', image: 'https://i.pinimg.com/736x/30/3f/ec/303fec093a26e20f3342431f4c0586e1.jpg', sub: ['Formal Pants', 'Trousers', 'Cargo Pants', 'Joggers', 'Leggings', 'Jeggings', 'Palazzos', 'Culottes', 'Bootcut Trousers', 'Paperbag Pants', 'Shorts'] },
  { id: 'western_dresses', name: 'Western Dresses', image: 'https://i.pinimg.com/736x/bf/91/b7/bf91b7238d4750db4f8877dcbd46839e.jpg', sub: ['Bodycon Dress', 'A-Line Dress', 'Fit & Flare Dress', 'Slip Dress', 'Maxi Dress', 'Midi Dress', 'Mini Dress', 'Shirt Dress', 'Wrap Dress', 'Off-Shoulder Dress', 'One-Shoulder Dress', 'Tube Dress', 'Cocktail Dress', 'Party Dress', 'Skater Dress', 'Ruffle Dress', 'Bandage Dress', 'Floral Dress', 'Puff-Sleeve Dress', 'Lace Dress'] },
  { id: 'traditional', name: 'Traditional Wear', image: 'https://i.pinimg.com/1200x/00/81/30/008130eefedeecaf24dbe77f04b5e296.jpg', sub: ['Sarees', 'Lehengas', 'Anarkali Suits', 'Sharara Sets', 'Gharara Sets', 'Punjabi Suits', 'Crop Top + Skirt Sets', 'Kurta Sets', 'Indo-Western Dresses', 'Ethnic Gowns', 'Designer Blouses', 'Dupattas', 'Ethnic Jackets'] },
  { id: 'fusion', name: 'Fusion & Indo-Western', image: 'https://i.pinimg.com/736x/0b/9f/cf/0b9fcf33ca1ab88c39b059e895e53a23.jpg', sub: ['Jacket Dresses', 'Cape Sets', 'Dhoti Pants', 'Asymmetrical Dresses', 'Festive Co-ords'] },
  { id: 'winter', name: 'Winter Wear', image: 'https://i.pinimg.com/1200x/21/c7/ea/21c7ea59299c59c6be2e26ef57c01940.jpg', sub: ['Hoodies', 'Sweatshirts', 'Knitted Sweaters', 'Cardigans', 'Trench Coats', 'Denim Jackets', 'Leather Jackets', 'Puffer Jackets'] },
  { id: 'activewear', name: 'Activewear', image: 'https://i.pinimg.com/1200x/ea/18/f7/ea18f7582d2715d4c6d17c3df0c2a6e1.jpg', sub: ['Sports Bras', 'Gym Tees', 'Gym Leggings', 'Yoga Pants', 'Sports Shorts', 'Trackpants', 'Running Sets'] },
  { id: 'footwear', name: 'Footwear', image: 'https://i.pinimg.com/736x/0f/07/a1/0f07a1af0a09d3c22132849b1f520cbf.jpg', sub: ['Sneakers', 'Loafers', 'Heels', 'Block Heels', 'Boots', 'Sandals', 'Sliders', 'Running Shoes', 'Ethnic Footwear'] },
  { id: 'accessories', name: 'Accessories', image: 'https://i.pinimg.com/736x/a2/17/6a/a2176a270897ddc123b070f260f1bb88.jpg', sub: ['Earrings', 'Necklaces', 'Bracelets', 'Watches', 'Sunglasses', 'Belts', 'Bags', 'Hair Accessories'] },
  { id: 'occasion', name: 'Occasion Styles', image: 'https://i.pinimg.com/736x/77/45/10/7745101a8e52954aa6ca34e4b6756ff8.jpg', sub: ['College Wear', 'Office Wear', 'Party Wear', 'Wedding Wear', 'Festive Wear', 'Casual Looks', 'Travel Outfits'] },
];

interface ShopScreenProps {
  onTryOn: (img: string, name: string) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onTryOn }) => {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{type: 'category' | 'item', name: string, categoryId?: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userStyle, setUserStyle] = useState<string | null>(null);
  
  const [activeShopMenuId, setActiveShopMenuId] = useState<string | null>(null);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('newYouUserProfile');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserStyle(data.styleType);
      } catch (e) {}
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Generate suggestions based on query
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const matches: any[] = [];
    CATEGORIES.forEach(cat => {
      if (cat.name.toLowerCase().includes(debouncedQuery.toLowerCase())) {
        matches.push({ type: 'category', name: cat.name, categoryId: cat.id });
      }
      cat.sub.forEach(sub => {
        if (sub.toLowerCase().includes(debouncedQuery.toLowerCase())) {
          matches.push({ type: 'item', name: sub, categoryId: cat.id });
        }
      });
    });

    setSuggestions(matches.slice(0, 8)); 
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveShopMenuId(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOrderedCategories = () => {
    if (!userStyle) return CATEGORIES;

    // Define priority based on Style Result
    const priorities: Record<string, string[]> = {
      "Casual Chic": ['tops', 'jeans', 'occasion', 'bottomwear'],
      "Trendy Diva": ['western_dresses', 'fusion', 'tops', 'footwear'],
      "Elegant Classic": ['western_dresses', 'formals', 'footwear', 'accessories'],
      "Sporty Cool": ['activewear', 'footwear', 'winter', 'bottomwear'],
      "Desi Queen": ['traditional', 'fusion', 'footwear', 'occasion']
    };

    const myPriorities = priorities[userStyle] || [];
    
    return [...CATEGORIES].sort((a, b) => {
      const idxA = myPriorities.indexOf(a.id);
      const idxB = myPriorities.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  };

  const handleGlobalTryOn = (img: string, name: string) => {
    setIsLoadingOverlay(true);
    setTimeout(() => {
      onTryOn(img, name);
      setIsLoadingOverlay(false);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const cat = CATEGORIES.find(c => c.id === suggestion.categoryId);
    if (cat) {
      setSelectedCategory(cat);
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const filteredCategories = getOrderedCategories().filter(cat => 
    cat.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const canCategoryTryOn = (catId: string) => {
    return !['activewear', 'footwear', 'accessories'].includes(catId);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 pb-40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)} 
              className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center border border-stone-200 hover:bg-stone-900 hover:text-white transition-all shadow-sm group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h1 className="text-5xl font-serif font-bold text-stone-900 leading-tight">
              {selectedCategory ? selectedCategory.name : "The Boutique"}
            </h1>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em] mt-2">
              {userStyle ? `Personalized for your ${userStyle} profile` : "Verified High-Fidelity Fashion Assets"}
            </p>
          </div>
        </div>

        <div className="relative group w-full md:w-96" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input 
              type="text" 
              placeholder="Search the archive..." 
              value={searchQuery}
              onFocus={() => setIsSearching(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl py-5 pl-14 pr-6 text-sm focus:border-amber-400 outline-none shadow-sm transition-all"
            />
          </div>
          {isSearching && suggestions.length > 0 && (
            <FadeIn className="absolute top-full left-0 right-0 mt-3 bg-white/80 backdrop-blur-xl border border-stone-100 rounded-[2rem] shadow-2xl z-[70] overflow-hidden max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button key={idx} onClick={() => handleSuggestionClick(suggestion)} className="w-full px-8 py-4 text-left hover:bg-amber-50 flex items-center justify-between group/item transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${suggestion.type === 'category' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      {suggestion.type === 'category' ? <Globe className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    </div>
                    <div><p className="text-xs font-bold text-stone-800">{suggestion.name}</p><p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">{suggestion.type}</p></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-200 group-hover/item:text-amber-500 group-hover/item:translate-x-1 transition-all" />
                </button>
              ))}
            </FadeIn>
          )}
        </div>
      </div>

      {!selectedCategory ? (
        <FadeIn className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCategories.map(cat => (
            <div key={cat.id} onClick={() => setSelectedCategory(cat)} className="aspect-[4/5] relative rounded-[3rem] overflow-hidden border border-stone-100 cursor-pointer group shadow-sm hover:shadow-xl transition-all">
              <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent p-10 flex flex-col justify-end text-white">
                <span className="text-[9px] font-bold text-amber-200 uppercase tracking-widest mb-2 block">{cat.sub.length} Variations</span>
                <h3 className="text-3xl font-serif font-bold leading-tight">{cat.name}</h3>
                <div className="mt-4 flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">Explore Registry <ChevronRight className="w-4 h-4" /></div>
              </div>
            </div>
          ))}
        </FadeIn>
      ) : (
        <FadeIn className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {selectedCategory.sub.map((sub, idx) => {
            const asset = STYLE_REGISTRY[sub] || STYLE_REGISTRY['default'];
            const itemId = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const showTryOn = canCategoryTryOn(selectedCategory.id);
            return (
              <div key={idx} className="bg-white rounded-[3.5rem] border border-stone-100 flex flex-col group hover:shadow-luxury transition-all relative">
                <div className="aspect-[3/4] relative bg-stone-50 overflow-hidden rounded-t-[3.5rem]">
                  <img src={asset.image} className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700" alt={sub} loading="lazy" />
                  {showTryOn && (<div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500"><button onClick={() => handleGlobalTryOn(asset.image, sub)} className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-xl"><Sparkles className="w-5 h-5" /></button></div>)}
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 bg-stone-900/80 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all"><FileBadge className="w-3 h-3 text-amber-200" /><span className="text-[8px] font-bold text-white uppercase tracking-widest">Archive Item</span></div>
                </div>
                <div className="p-10 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3"><span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">{selectedCategory.name}</span><h4 className="text-2xl font-serif font-bold text-stone-800 leading-snug">{sub}</h4><p className="text-sm text-stone-400 font-serif italic leading-relaxed">"{asset.desc}"</p></div>
                  <div className="flex gap-4 relative">
                    {showTryOn && (<Button variant="primary" className="flex-1 py-4 text-[9px] rounded-2xl" onClick={() => handleGlobalTryOn(asset.image, sub)} icon={<Sparkles className="w-4 h-4" />}>Try On</Button>)}
                    <div className="flex-1 relative">
                        <Button variant={showTryOn ? "outline" : "primary"} className={`w-full py-4 text-[9px] rounded-2xl ${showTryOn ? 'border-stone-200' : 'border-stone-900'}`} onClick={() => setActiveShopMenuId(activeShopMenuId === itemId ? null : itemId)} icon={<ShoppingBag className="w-4 h-4" />} >Shop Similar</Button>
                        {activeShopMenuId === itemId && (
                            <div ref={menuRef} className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-3xl shadow-2xl border border-stone-100 p-6 z-50 animate-fade-in-up">
                                <div className="text-center mb-4"><h3 className="text-[8px] font-bold text-stone-400 uppercase tracking-[0.2em]">External Retailers</h3></div>
                                <div className="grid grid-cols-3 gap-4">
                                    {STORES.map((store) => (<button key={store.id} onClick={() => { window.open(store.url(sub), '_blank'); setActiveShopMenuId(null); }} className="flex flex-col items-center gap-2 group/icon"><div className={`w-10 h-10 ${store.color} rounded-xl flex items-center justify-center text-white shadow-sm group-hover/icon:scale-110 transition-transform`}><ShoppingBag className="w-4 h-4" /></div><span className="text-[7px] font-bold uppercase tracking-widest text-stone-500 group-hover/icon:text-stone-900">{store.name}</span></button>))}
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </FadeIn>
      )}
      {isLoadingOverlay && <LoadingOverlay message="Fetching Archives..." />}
    </div>
  );
};
