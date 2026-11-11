export const bentoCompositions = {
  'World-Map-Bento': () => import('../../../public/assets/animations/World-Map-Bento.json'),
  'Line-Bento': () => import('../../../public/assets/animations/Line-Bento.json'),
  'Bento-Logo': () => import('../../../public/assets/animations/Bento-Logo.json'),
}

export const loadBentoPlayer = () => import('lottie-web/build/player/lottie_svg')
