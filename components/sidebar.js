import SearchInput from "@components/ui/search";
import Link from "next/link";
import Label from "./ui/label";

export default function Sidebar(props) {
  return (
    <div className="mt-5 font-sans">
      <Searchbar />
      {props.categories && (
        <Categories categories={props.categories} />
      )}
    </div>
  );
}

function Searchbar() {
  return (
    <div>
      <form action="/search" method="GET">
        <SearchInput placeholder="Search" />
      </form>
    </div>
  );
}

function Categories({ categories }) {
  console.log(categories);
  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold ">Categories</h3>
      <ul className="grid mt-4">
        {categories.map((item, index) => (
          <li key={item._id}>
            <Link href={`/category/${item.slug.current}`}>
              <a className="flex items-center justify-between py-2">
                <h4 className="text-gray-800">{item.title}</h4>
                <Label pill={true} color={item.color}>
                  {item.count}
                </Label>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
