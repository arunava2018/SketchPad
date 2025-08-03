  import { TbRectangle } from "react-icons/tb";
  import { IoMdDownload } from "react-icons/io";
  import { FaLongArrowAltRight } from "react-icons/fa";
  import { LuPencil } from "react-icons/lu";
  import { GiArrowCursor } from "react-icons/gi";
  import { FaRegCircle } from "react-icons/fa6";
  import { IoMoonSharp } from "react-icons/io5";
  import { IoIosSunny } from "react-icons/io";
  import { GiEraser } from "react-icons/gi";
  import { useAuth0 } from "@auth0/auth0-react";
  import {
    Arrow,
    Circle,
    Layer,
    Line,
    Rect,
    Stage,
    Transformer,
  } from "react-konva";
  import { useEffect, useRef, useState } from "react";
  import { v4 as uuidv4 } from "uuid";
  import { ACTIONS } from "./constants";

  export default function App() {
    const stageRef = useRef();
    const [action, setAction] = useState(ACTIONS.SELECT);
    const [theme, setTheme] = useState("light");
    const [fillColor, setFillColor] = useState("#ff0000");
    const [rectangles, setRectangles] = useState([]);
    const [circles, setCircles] = useState([]);
    const [arrows, setArrows] = useState([]);
    const [scribbles, setScribbles] = useState([]);
    const strokeColor = theme === "dark" ? "#ffffff" : "#000000";
    const isPaining = useRef();
    const currentShapeId = useRef();
    const transformerRef = useRef();

    const isDraggable = action === ACTIONS.SELECT;
    useEffect(() => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    });

    const { logout } = useAuth0();
    const { loginWithRedirect } = useAuth0();
    const { user, isAuthenticated, isLoading } = useAuth0();
    const handleThemeSwitch = () => {
      setTheme(theme === "dark" ? "light" : "dark");
    };

    const resetCanvas = () => {
      setRectangles([]);
      setCircles([]);
      setArrows([]);
      setScribbles([]);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    };

    function onPointerDown(e) {
      if (e.target.attrs.id === "resetButton") return;

      if (action === ACTIONS.SELECT) return;

      const stage = stageRef.current;
      const { x, y } = stage.getPointerPosition();
      const id = uuidv4();
      // console.log(id);

      currentShapeId.current = id;
      isPaining.current = true;

      switch (action) {
        case ACTIONS.RECTANGLE:
          setRectangles((rectangles) => [
            ...rectangles,
            {
              id,
              x,
              y,
              height: 20,
              width: 20,
              fillColor,
            },
          ]);
          break;
        case ACTIONS.CIRCLE:
          setCircles((circles) => [
            ...circles,
            {
              id,
              x,
              y,
              radius: 20,
              fillColor,
            },
          ]);
          break;

        case ACTIONS.ARROW:
          setArrows((arrows) => [
            ...arrows,
            {
              id,
              points: [x, y, x + 20, y + 20],
              fillColor,
            },
          ]);
          break;
        case ACTIONS.SCRIBBLE:
          setScribbles((scribbles) => [
            ...scribbles,
            {
              id,
              points: [x, y],
              fillColor,
            },
          ]);
          break;
      }
    }

    function onPointerMove() {
      if (action === ACTIONS.SELECT || !isPaining.current) return;

      const stage = stageRef.current;
      const { x, y } = stage.getPointerPosition();

      switch (action) {
        case ACTIONS.RECTANGLE:
          setRectangles((rectangles) =>
            rectangles.map((rectangle) => {
              if (rectangle.id === currentShapeId.current) {
                return {
                  ...rectangle,
                  width: x - rectangle.x,
                  height: y - rectangle.y,
                };
              }
              return rectangle;
            })
          );
          break;
        case ACTIONS.CIRCLE:
          setCircles((circles) =>
            circles.map((circle) => {
              if (circle.id === currentShapeId.current) {
                return {
                  ...circle,
                  radius: ((y - circle.y) ** 2 + (x - circle.x) ** 2) ** 0.5,
                };
              }
              return circle;
            })
          );
          break;
        case ACTIONS.ARROW:
          setArrows((arrows) =>
            arrows.map((arrow) => {
              if (arrow.id === currentShapeId.current) {
                return {
                  ...arrow,
                  points: [arrow.points[0], arrow.points[1], x, y],
                };
              }
              return arrow;
            })
          );
          break;
        case ACTIONS.SCRIBBLE:
          setScribbles((scribbles) =>
            scribbles.map((scribble) => {
              if (scribble.id === currentShapeId.current) {
                return {
                  ...scribble,
                  points: [...scribble.points, x, y],
                };
              }
              return scribble;
            })
          );
          break;
      }
    }

    function onPointerUp() {
      isPaining.current = false;
    }

    function handleExport() {
      const uri = stageRef.current.toDataURL();
      var link = document.createElement("a");
      link.download = "image.png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function onClick(e) {
      if (action !== ACTIONS.SELECT) return;
      const target = e.currentTarget;
      console.log(target);
      transformerRef.current.nodes([target]);
      transformerRef.current.getLayer().batchDraw();
    }

    return (
      <>
        <div className="relative w-full h-screen overflow-hidden">
          {/* Controls */}
          <div className="absolute top-0 z-10 w-full py-2 text-center flex flex-col items-center justify-between">
            <div className="flex justify-center items-center sm:gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg dark:bg-slate-900 dark:text-white">
              <button
                className={
                  action === ACTIONS.SELECT
                    ? "bg-violet-300 p-1 rounded dark:bg-violet-400"
                    : "p-1 hover:bg-violet-100 rounded dark:hover:bg-gray-600"
                }
                onClick={() => setAction(ACTIONS.SELECT)}
              >
                <GiArrowCursor className="text-xl md:text-3xl" />
              </button>
              <button
                className={
                  action === ACTIONS.RECTANGLE
                    ? "bg-violet-300 p-1 dark:bg-violet-400"
                    : "p-1 hover:bg-violet-100 rounded dark:hover:bg-gray-600"
                }
                onClick={() => setAction(ACTIONS.RECTANGLE)}
              >
                <TbRectangle className="text-xl md:text-3xl" />
              </button>
              <button
                className={
                  action === ACTIONS.CIRCLE
                    ? "bg-violet-300 p-1 rounded dark:bg-violet-400"
                    : "p-1 hover:bg-violet-100 rounded dark:hover:bg-gray-600"
                }
                onClick={() => setAction(ACTIONS.CIRCLE)}
              >
                <FaRegCircle className="text-xl md:text-3xl" />
              </button>
              <button
                className={
                  action === ACTIONS.ARROW
                    ? "bg-violet-300 p-1 rounded dark:bg-violet-400"
                    : "p-1 hover:bg-violet-100 rounded dark:hover:bg-gray-600"
                }
                onClick={() => setAction(ACTIONS.ARROW)}
              >
                <FaLongArrowAltRight className="text-xl md:text-3xl" />
              </button>
              <button
                className={
                  action === ACTIONS.SCRIBBLE
                    ? "bg-violet-300 p-1 rounded dark:bg-violet-400"
                    : "p-1 hover:bg-violet-100 rounded dark:hover:bg-gray-600"
                }
                onClick={() => setAction(ACTIONS.SCRIBBLE)}
              >
                <LuPencil className="text-xl md:text-3xl" />
              </button>

              <button>
                <input
                  className="w-6 h-6 border-black"
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                />
              </button>

              <button onClick={handleExport}>
                <IoMdDownload className="text-xl md:text-3xl" />
              </button>
              <button onClick={handleThemeSwitch}>
                {theme === "dark" ? (
                  <IoMoonSharp className="text-xl md:text-3xl" />
                ) : (
                  <IoIosSunny className="text-xl md:text-3xl" />
                )}
              </button>
            </div>
            <p
              className={
                theme === "dark" ? "text-gray-300 text-xs" : "text-black text-xs"
              }
            >
              Click and drag, release when you're finished
            </p>
          </div>
          
          {/* Canvas */}
          <div>
            <Stage
              className={theme === "dark" ? "bg-slate-900" : "bg-white"}
              ref={stageRef}
              width={window.innerWidth}
              height={window.innerHeight}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <Layer>
                {/* <Rect
                  x={0}
                  y={0}
                  height={window.innerHeight}
                  width={window.innerWidth}
                  fill="#0000"
                  id="bg"
                  onClick={() => {
                    transformerRef.current.nodes([]);
                  }}
                /> */}

                {rectangles.map((rectangle) => {
                  return (
                    <Rect
                      key={rectangle.id}
                      x={rectangle.x}
                      y={rectangle.y}
                      stroke={strokeColor}
                      strokeWidth={2}
                      fill={rectangle.fillColor}
                      height={rectangle.height}
                      width={rectangle.width}
                      draggable={isDraggable}
                      onClick={onClick}
                    />
                  );
                })}

                {circles.map((circle) => (
                  <Circle
                    key={circle.id}
                    radius={circle.radius}
                    x={circle.x}
                    y={circle.y}
                    stroke={strokeColor}
                    strokeWidth={2}
                    fill={circle.fillColor}
                    draggable={isDraggable}
                    onClick={onClick}
                  />
                ))}
                {arrows.map((arrow) => (
                  <Arrow
                    key={arrow.id}
                    points={arrow.points}
                    stroke={strokeColor}
                    strokeWidth={2}
                    fill={arrow.fillColor}
                    draggable={isDraggable}
                    onClick={onClick}
                  />
                ))}

                {scribbles.map((scribble) => (
                  <Line
                    key={scribble.id}
                    lineCap="round"
                    lineJoin="round"
                    points={scribble.points}
                    stroke={strokeColor}
                    strokeWidth={2}
                    fill={scribble.fillColor}
                    draggable={isDraggable}
                    onClick={onClick}
                  />
                ))}

                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>

          <div className="absolute bottom-20 md:bottom-10 left-1/2 transform -translate-x-1/2 flex flex-row space-x-5">
            <button
              id="resetButton"
              className={
                theme === "dark"
                  ? "text-white border-2 border-violet-400 bg-violet-400 px-2 py-2 rounded-md text-xs sm:text-xl"
                  : "text-black border-2 border-violet-400 bg-violet-400 px-2 py-2 rounded-md text-xs sm:text-xl"
              }
              onClick={resetCanvas}
            >
              Clear Canvas
            </button>
            {isAuthenticated ?(
            <button
              className={
                theme === "dark"
                  ? "text-white border-2 border- px-2 py-2 border-violet-400 rounded-md text-xs sm:text-xl bg-violet-400"
                  : "text-black border-2 border-violet-400 px-2 py-2 rounded-md text-xs sm:text-xl bg-violet-400"
              }
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              Log Out
            </button>)
            :(<button
              className={
                theme === "dark"
                  ? "text-white border-2 border-violet-400 px-2 py-2 rounded-md text-xs sm:text-xl bg-violet-400"
                  : "text-black border-2 border-violet-400 px-2 py-2 rounded-md text-xs sm:text-xl bg-violet-400"
              }
              onClick={() => loginWithRedirect()}
            >
              LogIn
            </button>)}
          </div>
        </div>
      </>
    );
  }
