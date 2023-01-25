import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMovies, IGetMoviesResult } from '../api';
import { makeImagePath } from '../utils';

const SliderContainer = styled.div`
  position: relative;
  top: -100px;
  height: 200px;
  width: 100%;
`;

const PrevBtn = styled(motion.div)`
  position: absolute;
  left: 0px;
  height: 100%;
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;

const PrevArrow = styled(motion.div)`
  width: 20px;
  opacity: 0;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0 60px 0;
  overflow-x: visible;
`;

const NextBtn = styled(motion.div)`
  position: absolute;
  right: 0px;
  height: 100%;
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;

const NextArrow = styled(motion.div)`
  width: 20px;
  opacity: 0;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 100%;
  width: 100%;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;
const Info = styled(motion.div)`
  padding: 20px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const rowVariants = {
  hidden: { x: window.outerWidth + 5 },
  visible: { x: 0 },
  exit: { x: -window.outerWidth - 5 },
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.5,
    y: -50,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: 'tween',
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: 'tween',
    },
  },
};

const btnVariants = {
  hover: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
};

const btnArrowVariants = {
  hover: {
    opacity: 1,
  },
  hoverSliderAndBtn: {
    opacity: 1,
    width: '30px',
  },
};

const offset = 6;

function Slider() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const { data } = useQuery<IGetMoviesResult>(
    ['movies', 'nowPlaying'],
    getMovies
  );
  const [leaving, setLeaving] = useState(false);
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const [enterInSlider, setEnterInSlider] = useState(false);
  const toggleEnterInSlider = () => setEnterInSlider((prev) => !prev);
  const [enterInPrevBtn, setEnterInPrevBtn] = useState(false);
  const toggleEnterInPrevBtn = () => setEnterInPrevBtn((prev) => !prev);
  const [enterInNextBtn, setEnterInNextBtn] = useState(false);
  const toggleEnterInNextBtn = () => setEnterInNextBtn((prev) => !prev);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = data.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = () => {};
  const onBoxClicked = (movieId: number) => {
    navigate(`movies/${movieId}`);
  };

  return (
    <SliderContainer
      onMouseEnter={toggleEnterInSlider}
      onMouseLeave={toggleEnterInSlider}
    >
      <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
        <PrevBtn
          onClick={decreaseIndex}
          onMouseEnter={toggleEnterInPrevBtn}
          onMouseLeave={toggleEnterInPrevBtn}
          variants={btnVariants}
          animate={enterInPrevBtn ? 'hover' : undefined}
        >
          <PrevArrow
            variants={btnArrowVariants}
            animate={
              enterInSlider
                ? enterInPrevBtn
                  ? 'hoverSliderAndBtn'
                  : 'hover'
                : undefined
            }
          >
            <motion.svg
              initial={{ fill: 'rgba(255,255,255,0)' }}
              animate={{ fill: 'rgba(255,255,255,1)' }}
              exit={{ fill: 'rgba(255,255,255,0)' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
            </motion.svg>
          </PrevArrow>
        </PrevBtn>
        <Row
          variants={rowVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'tween', duration: 1 }}
          key={index}
        >
          {data?.results
            .slice(1)
            .slice(offset * index, offset * index + offset)
            .map((movie) => (
              <Box
                layoutId={String(movie.id)}
                key={movie.id}
                variants={boxVariants}
                initial="normal"
                onClick={() => onBoxClicked(movie.id)}
                whileHover="hover"
                transition={{ type: 'tween' }}
                bgPhoto={makeImagePath(movie.backdrop_path, 'w500')}
              >
                <Info variants={infoVariants}>
                  <h4>{movie.title}</h4>
                </Info>
              </Box>
            ))}
        </Row>
        <NextBtn
          onClick={increaseIndex}
          onMouseEnter={toggleEnterInNextBtn}
          onMouseLeave={toggleEnterInNextBtn}
          variants={btnVariants}
          animate={enterInNextBtn ? 'hover' : undefined}
        >
          <NextArrow
            variants={btnArrowVariants}
            animate={
              enterInSlider
                ? enterInNextBtn
                  ? 'hoverSliderAndBtn'
                  : 'hover'
                : undefined
            }
          >
            <motion.svg
              initial={{ fill: 'rgba(255,255,255,0)' }}
              animate={{ fill: 'rgba(255,255,255,1)' }}
              exit={{ fill: 'rgba(255,255,255,0)' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
            </motion.svg>
          </NextArrow>
        </NextBtn>
      </AnimatePresence>
    </SliderContainer>
  );
}

export default Slider;
