import { AmbiguousDnaAlphabet, AmbiguousProteinAlphabet, AmbiguousRnaAlphabet, DnaAlphabet, IAlphabet, ProteinAlphabet, RnaAlphabet } from './alphabet';



/// <summary>
/// The currently supported and built-in alphabets for sequence items.
/// </summary>
export class Alphabets {

  /// <summary>
  /// The DNA alphabet.
  /// </summary>
  public static readonly DNA: DnaAlphabet = new DnaAlphabet();

  /// <summary>
  /// The RNA alphabet.
  /// </summary>
  public static readonly RNA: RnaAlphabet = new RnaAlphabet();

  /// <summary>
  /// The protein alphabet consisting of amino acids.
  /// </summary>
  public static readonly protein: ProteinAlphabet = new ProteinAlphabet();

  /// <summary>
  /// The Ambiguous DNA alphabet.
  /// </summary>
  public static readonly ambiguousDNA: AmbiguousDnaAlphabet = new AmbiguousDnaAlphabet();

  /// <summary>
  /// The Ambiguous RNA alphabet.
  /// </summary>
  public static readonly ambiguousRNA: AmbiguousRnaAlphabet = new AmbiguousRnaAlphabet();

  /// <summary>
  /// The Ambiguous protein alphabet consisting of amino acids.
  /// </summary>
  public static readonly ambiguousProtein: AmbiguousProteinAlphabet = new AmbiguousProteinAlphabet();

  /// <summary>
  /// Mapping between an alphabet type and its corresponding base alphabet type.
  /// </summary>
  public static readonly alphabetToBaseAlphabetMap: object = {}; //Dictionary<IAlphabet, IAlphabet> 

  /// <summary>
  /// Mapping between an alphabet type and its corresponding ambiguous alphabet type.
  /// </summary>
  public static readonly ambiguousAlphabetMap: object = {}; //Dictionary<IAlphabet, IAlphabet>

  /// <summary>
  /// List of all supported Alphabets.
  /// </summary>
  private static readonly knownAlphabets: IAlphabet[] = [
    Alphabets.DNA,
    Alphabets.ambiguousDNA,
    Alphabets.RNA,
    Alphabets.ambiguousRNA,
    Alphabets.protein,
    Alphabets.ambiguousProtein
  ];

  /// <summary>
  /// List of alphabet instances according to their priority in auto detection
  /// Auto detection starts from top of the list.
  /// </summary>
  private static readonly alphabetPriorityList: IAlphabet[] = [
    new DnaAlphabet(),
    new AmbiguousDnaAlphabet(),
    new RnaAlphabet(),
    new AmbiguousRnaAlphabet(),
    new ProteinAlphabet(),
    new AmbiguousProteinAlphabet()
  ];

  
  /// <summary>
  /// Initializes static members of the Alphabets class.
  /// </summary>

  static initialize() {
    // Get the registered alphabets.
    // let registeredAlphabets: IAlphabet[] = this.getAlphabets();
    // if (registeredAlphabets) {
    //   let knownNames = Alphabets.knownAlphabets.map(a => a.name);
    //   for (let alphabet of registeredAlphabets.filter(a => knownNames.indexOf(a.name) > -1))
    //     this.knownAlphabets.push(alphabet);
    // }

    Alphabets.mapAlphabetToAmbiguousAlphabet(new DnaAlphabet(), new AmbiguousDnaAlphabet());
    Alphabets.mapAlphabetToAmbiguousAlphabet(new RnaAlphabet(), new AmbiguousRnaAlphabet());
    Alphabets.mapAlphabetToAmbiguousAlphabet(new ProteinAlphabet(), new AmbiguousProteinAlphabet());
    Alphabets.mapAlphabetToAmbiguousAlphabet(new AmbiguousDnaAlphabet(), new AmbiguousDnaAlphabet());
    Alphabets.mapAlphabetToAmbiguousAlphabet(new AmbiguousRnaAlphabet(), new AmbiguousRnaAlphabet());

    Alphabets.mapAlphabetToBaseAlphabet(new AmbiguousDnaAlphabet(), new DnaAlphabet());
    Alphabets.mapAlphabetToBaseAlphabet(new AmbiguousRnaAlphabet(), new RnaAlphabet());
    Alphabets.mapAlphabetToBaseAlphabet(new AmbiguousProteinAlphabet(), new ProteinAlphabet());

    //Alphabets.MapAlphabetToBaseAlphabet(new MummerDnaAlphabet(), new DnaAlphabet());
    //Alphabets.MapAlphabetToBaseAlphabet(new MummerRnaAlphabet(), new RnaAlphabet());
    //Alphabets.MapAlphabetToBaseAlphabet(new MummerProteinAlphabet(), new ProteinAlphabet());
  }


  /// <summary>
  ///  Gets the list of all Alphabets which are supported by the framework.
  /// </summary>
  public static get all(): IAlphabet[] { return Alphabets.knownAlphabets };


  /// <summary>
  /// Gets the ambiguous alphabet
  /// </summary>
  /// <param name="currentAlphabet">Alphabet to validate</param>
  /// <returns></returns>
  public static getAmbiguousAlphabet(currentAlphabet: IAlphabet): IAlphabet {
    let ambiguousAlphabet = Alphabets.ambiguousAlphabetMap[currentAlphabet.name];
    return ambiguousAlphabet ? ambiguousAlphabet : currentAlphabet;
  }

  /// <summary>
  /// Verifies if two given alphabets comes from the same base alphabet.
  /// </summary>
  /// <param name="alphabetA">First alphabet to compare.</param>
  /// <param name="alphabetB">Second alphabet to compare.</param>
  /// <returns>True if both alphabets comes from the same base class.</returns>
  public static checkIsFromSameBase(alphabetA: IAlphabet, alphabetB: IAlphabet): boolean {
    if (alphabetA === alphabetB) return true;

    let innerAlphabetA: IAlphabet = alphabetA, 
        innerAlphabetB: IAlphabet = alphabetB;

    if (Alphabets.alphabetToBaseAlphabetMap[alphabetA.name])
      innerAlphabetA = Alphabets.alphabetToBaseAlphabetMap[alphabetA.name];

    if (Alphabets.alphabetToBaseAlphabetMap[alphabetB.name])
      innerAlphabetB = Alphabets.alphabetToBaseAlphabetMap[alphabetB.name];

    return innerAlphabetA === innerAlphabetB;
  }

  /// <summary>
  /// This methods loops through supported alphabet types and tries to identify
  /// the best alphabet type for the given symbols.
  /// </summary>
  /// <param name="symbols">Symbols on which auto detection should be performed.</param>
  /// <param name="offset">Offset from which the auto detection should start.</param>
  /// <param name="length">Number of symbols to process from the offset position.</param>
  /// <param name="identifiedAlphabetType">In case the symbols passed are a sub set of a bigger sequence, 
  /// provide the already identified alphabet type of the sequence.</param>
  /// <returns>Returns the detected alphabet type or null if detection fails.</returns>
  public static AutoDetectAlphabet(symbols: string[], offset: number, length: number, identifiedAlphabetType: IAlphabet): IAlphabet {
    let currentPriorityIndex: number = 0;

    if (!identifiedAlphabetType) identifiedAlphabetType = Alphabets.alphabetPriorityList[0];

    while (identifiedAlphabetType != Alphabets.alphabetPriorityList[currentPriorityIndex]) {
      // Increment priority index and validate boundary condition
      if (++currentPriorityIndex == Alphabets.alphabetPriorityList.length) throw new Error('Could not recognize alphabet');
    }

    // Start validating against alphabet types according to their priority
    while (!Alphabets.alphabetPriorityList[currentPriorityIndex].validateSequence(symbols.toString(), offset, length)) {
      // Increment priority index and validate boundary condition
      if (++currentPriorityIndex === Alphabets.alphabetPriorityList.length) {
        // Last ditch effort - look at all registered alphabets and see if any contain all the located symbols.
        for (let alphabet of Alphabets.all)
          if (alphabet.validateSequence(symbols.toString(), offset, length)) return alphabet;
        // No alphabet found.
        return null;
      }
    }

    return Alphabets.alphabetPriorityList[currentPriorityIndex];
  }

  /// <summary>
  /// Maps the alphabet to its base alphabet.
  /// For example: AmbiguousDnaAlphabet to DnaAlphabet
  /// </summary>
  /// <param name="alphabet">Alphabet to map.</param>
  /// <param name="baseAlphabet">Base alphabet to map.</param>
  private static mapAlphabetToBaseAlphabet(alphabet: IAlphabet, baseAlphabet: IAlphabet) {
    Alphabets.alphabetToBaseAlphabetMap[alphabet.name] = baseAlphabet;
  }

  /// <summary>
  /// Maps the alphabet to its ambiguous alphabet.
  /// For example: DnaAlphabet to AmbiguousDnaAlphabet.
  /// </summary>
  /// <param name="alphabet">Alphabet to map.</param>
  /// <param name="ambiguousAlphabet">Ambiguous alphabet to map.</param>
  private static mapAlphabetToAmbiguousAlphabet(alphabet: IAlphabet, ambiguousAlphabet: IAlphabet) {
    Alphabets.ambiguousAlphabetMap[alphabet.name] = ambiguousAlphabet;
  }

  /// <summary>
  /// Gets all registered alphabets in core folder and addins (optional) folders.
  /// </summary>
  /// <returns>List of registered alphabets.</returns>
  // private static getAlphabets(): IAlphabet[] {
  //   let implementations = BioRegistrationService.LocateRegisteredParts<IAlphabet>();
  //   var registeredAlphabets = new List<IAlphabet>();

  //   foreach(var impl in implementations)
  //   {
  //     try {
  //       IAlphabet alpha = Activator.CreateInstance(impl) as IAlphabet;
  //       if (alpha != null)
  //         registeredAlphabets.Add(alpha);
  //     }
  //     catch
  //     {
  //       // Cannot create - no default ctor?
  //     }
  //   }

  //   return registeredAlphabets;
  // }

}