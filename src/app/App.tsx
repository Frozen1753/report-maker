import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/LayoutDom";
import Page from "./components/page/Page";
import { MDX_PATHS } from "../../report";

export default function App() {

  console.log(MDX_PATHS)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route index element={<Page src={MDX_PATHS.INDEX} />} />
          {MDX_PATHS.PAGES.map((src, idx) => (
            <Route key={idx} path={src} element={<Page src={src} />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
