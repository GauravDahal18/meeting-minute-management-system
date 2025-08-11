import React, { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";

const CommitteeLayout = () => {
  const { committeeId } = useParams();

  useEffect(() => {
    console.log("CommitteeLayout: Component mounted", { committeeId });
    return () => {
      console.log("CommitteeLayout: Component unmounted");
    };
  }, [committeeId]);

  console.log("CommitteeLayout: Component rendering", { committeeId });

  return (
    <>
      <Outlet />
    </>
  );
};

export default CommitteeLayout;
