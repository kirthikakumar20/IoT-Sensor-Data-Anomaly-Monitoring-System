stateDiagram-v2
    [*] --> Disconnected

    Disconnected --> Normal: Valid normal reading
    Disconnected --> Warning: Warning reading
    Disconnected --> Faulty: Faulty reading

    Normal --> Warning: Abnormal reading
    Normal --> Faulty: Critical reading
    Normal --> Disconnected: No reading for 60 seconds

    Warning --> Normal: Normal reading
    Warning --> Faulty: Critical reading
    Warning --> Disconnected: No reading for 60 seconds

    Faulty --> Normal: Normal reading
    Faulty --> Warning: Warning reading
    Faulty --> Disconnected: No reading for 60 seconds

    Disconnected --> Disconnected: No new reading
 Current State       Input / Condition    Next State
  Disconnected        Normal reading       Normal
  Disconnected        Warning reading      Warning
  Disconnected        Faulty reading       Faulty
  Normal              Normal reading       Normal
  Normal              Warning reading      Warning
  Normal              Faulty reading       Faulty
  Warning             Normal reading       Normal
  Warning             Warning reading      Warning
  Warning             Faulty reading       Faulty
  Faulty              Normal reading       Normal
  Faulty              Warning reading      Warning
  Faulty              Faulty reading       Faulty
  Any connected state  No reading for 60 seconds   Disconnected
  Disconnected        No new reading       Disconnected